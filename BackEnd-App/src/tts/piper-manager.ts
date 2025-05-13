import { mkdir, existsSync, chmodSync, createWriteStream, statSync } from 'fs';
import { mkdir as mkdirAsync } from 'fs/promises';
import { pipeline } from 'stream/promises';
import { spawn } from 'child_process';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import axios from 'axios';
import * as path from 'path';
import * as os from 'os';
import * as tar from 'tar';
import * as unzipper from 'unzipper';
import * as fs from 'fs';

@Injectable()
export class PiperManager implements OnModuleInit {
  private readonly logger = new Logger(PiperManager.name);
  private readonly baseDir = path.join(__dirname, '..', 'piper');
  private readonly modelDir = path.join(this.baseDir, 'model');
  private readonly binaryPath = path.join(this.baseDir, 'piper', 'piper');
  private piperProcess: ReturnType<typeof spawn> | null = null;
  private busy = false;
  private ttsFolder = path.join('./', 'dist', 'tts-audio');

  async onModuleInit(): Promise<void> {
    fs.rmdirSync(this.ttsFolder, { recursive: true });
    await mkdirAsync(this.ttsFolder, { recursive: true });
    this.logger.log('Initializing PiperManager...');
    await this.ensurePiperAndModel();
    this.logger.log('Piper binary and model ready');

  }

  private async ensurePiperAndModel(): Promise<void> {
    await mkdirAsync(this.modelDir, { recursive: true });

    const isWindows = os.platform() === 'win32';
    const archiveName = isWindows ? 'piper_windows_amd64.zip' : 'piper_arm64.tar.gz';
    const archiveUrl = isWindows
      ? 'https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_windows_amd64.zip'
      : 'https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_arm64.tar.gz';

    const archivePath = path.join(this.baseDir, archiveName);


    if (!(existsSync(this.binaryPath + ".exe") || existsSync(this.binaryPath + ".sh"))) {
      this.logger.log(`Downloading Piper binary from ${archiveUrl} to ${this.binaryPath}`);
      await this.downloadFile(archiveUrl, archivePath);

      if (isWindows) {
        await fs.createReadStream(archivePath).pipe(unzipper.Extract({ path: this.baseDir })).promise();
      } else {
        await tar.extract({ file: archivePath, cwd: this.baseDir });
        chmodSync(this.binaryPath, 0o755);
      }
    }

    const modelFiles = [
      {
        name: 'en_US-ryan-high.onnx',
        url: 'https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/ryan/high/en_US-ryan-high.onnx?download=true',
      },
      {
        name: 'en_US-ryan-high.onnx.json',
        url: 'https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/ryan/high/en_US-ryan-high.onnx.json?download=true',
      },
    ];

    for (const file of modelFiles) {
      const filePath = path.join(this.modelDir, file.name);
      if (!existsSync(filePath)) {
        this.logger.log(`Downloading model: ${file.name}`);
        await this.downloadFile(file.url, filePath);
      }
    }
  }

  private async downloadFile(url: string, dest: string): Promise<void> {
    const res = await axios.get(url, { responseType: 'stream' });
    await pipeline(res.data, createWriteStream(dest));
  }

  private async initializePiper(opts: { model: string; config: string }) {
    if (this.piperProcess) return;

    // let outputFolder = path.resolve(this.ttsFolder);

    // '--config', path.join(this.modelDir, opts.config),
    this.piperProcess = spawn(this.binaryPath, [
      '--model', path.resolve(path.join(this.modelDir, opts.model)),
      '--json-input',
      '--cuda',
      `--output_folder`, path.resolve(this.ttsFolder)
    ]   , {
      cwd: this.ttsFolder // Set the working directory
    });



    // this.piperProcess = spawn(path.resolve(this.binaryPath), [
    //   '--model', path.resolve(path.join(this.modelDir, opts.model)),
    //   '--json-input',
    //    `--output_folder`, './'
    // ], {
    //   cwd: this.ttsFolder // Set the working directory
    // });


    this.piperProcess?.stderr?.on('data', (data) => {
      this.logger.warn(`Piper stderr: ${data}`);
    });

    this.piperProcess.on('exit', (code) => {
      this.logger.error(`Piper exited with code ${code}`);
      this.piperProcess = null;
    });

    this.piperProcess.on('error', (err) => {
      this.logger.error('Piper process error:', err);
      this.piperProcess = null;
    });
  }

  async speakToFile(text: string): Promise<string> {
    await this.initializePiper({ model: 'en_US-ryan-high.onnx', config: 'en_US-ryan-high.onnx.json' });
    return await this.processRequest(text);
  }

  private async processRequest(text: string): Promise<string> {
    this.busy = true;
    

    const filename = `speech-${Date.now()}.wav`;
    const outputPath = path.join(this.ttsFolder, filename);

    this.piperProcess?.stdin?.write(JSON.stringify({ text, output_file: path.basename(outputPath) }) + '\n');

    try {
      await this.waitForFileWriteComplete(outputPath);
      this.busy = false;
    } catch (err) {
      this.busy = false;
    }
    return outputPath;
  }

  private async waitForFileWriteComplete(
    filePath: string,
    timeout = 10000,
    interval = 1000,
    stableCountRequired = 3
  ): Promise<void> {
    const start = Date.now();
    let prevSize = -1;
    let stableCount = 0;

    return new Promise((resolve, reject) => {
      const check = () => {
        try {
          const stats = statSync(filePath);
          const currentSize = stats.size;

          if (currentSize === prevSize) {
            stableCount++;
          } else {
            stableCount = 0;
          }

          prevSize = currentSize;

          if (stableCount >= stableCountRequired && currentSize > 0) {
            this.logger.debug(`File is stable - ${filePath} (size: ${currentSize})`);
            return resolve();
          }
        } catch (err: any) {
          if (err.code !== 'ENOENT') {
            return reject(err); // throw if it's not a "file doesn't exist" error
          }
          // File not yet created; just wait and try again
        }

        if (Date.now() - start > timeout) {
          return reject(new Error(`File write timeout: ${filePath}`));
        }

        setTimeout(check, interval);
      };

      check(); // Start checking immediately
    });
  }


}
