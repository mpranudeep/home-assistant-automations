import { createWriteStream, existsSync, chmodSync } from 'fs';
import { mkdir } from 'fs/promises';
import { pipeline } from 'stream/promises';
import axios from 'axios';
import * as path from 'path';
import * as os from 'os';
import * as tar from 'tar';
import { spawn } from 'child_process';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

export class PiperManager {
  readonly baseDir = path.join(__dirname, '..', 'piper');
  readonly tarballUrl = 'https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_arm64.tar.gz';
  readonly modelDir = path.join(this.baseDir, 'model');
  readonly binaryPath = path.join(this.baseDir, 'piper','piper');
  private readonly logger = new Logger(PiperManager.name);

  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing PiperService...');
    await this.ensurePiperAndModel();
    this.logger.log('Piper binary and model ready');
  }

  async ensurePiperAndModel(): Promise<void> {
    await mkdir(this.modelDir, { recursive: true });

    // Download and extract Piper binary
    if (!existsSync(this.binaryPath)) {
      const archivePath = path.join(this.baseDir, 'piper.tar.gz');
      await this.downloadFile(this.tarballUrl, archivePath);
      await tar.extract({ file: archivePath, cwd: this.baseDir });
      chmodSync(this.binaryPath, 0o755);
    }

    // Download voice model
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
      const modelPath = path.join(this.modelDir, file.name);
      if (!existsSync(modelPath)) {
        await this.downloadFile(file.url, modelPath);
      }
    }
  }

  private async downloadFile(url: string, dest: string): Promise<void> {
    const res = await axios.get(url, { responseType: 'stream' });
    await pipeline(res.data, createWriteStream(dest));
  }

  private runPiper(text: string, outputPath: string, opts: { model: string; config: string }): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(this.binaryPath, [
      '--model', path.join(this.modelDir, opts.model),
      '--config', path.join(this.modelDir, opts.config),
      '--output_file', outputPath,
    ]);

    child.stdin.write(text);
    child.stdin.end();

    child.stderr.on('data', (data) => {
      console.warn(`Piper stderr: ${data}`);
    });

    child.on('exit', (code) => {
      code === 0 ? resolve() : reject(new Error(`Piper exited with code ${code}`));
    });
  });
}

async speakToFile(text: string, outputPath: string): Promise<void> {
  await this.runPiper(text, outputPath, {
    model: 'en_US-ryan-high.onnx',
    config: 'en_US-ryan-high.onnx.json',
  });
}
}
