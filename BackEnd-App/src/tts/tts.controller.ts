import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PiperManager } from './piper-manager';
import * as path from 'path';
import { fstat, rmSync, unlink} from 'fs';
import { mkdir } from 'fs/promises';

@Controller('api/text-to-speech')
export class TtsController {
  

  constructor(private readonly ttsService: PiperManager) {}

  @Post('convert')
  async convertTextToSpeech(@Body('text') text: string) {
    const filename = `speech-${Date.now()}.wav`;
    const ttsFolder = path.join('./', 'dist', 'tts-audio')
    
    await mkdir(ttsFolder, { recursive: true });
    
    let outputPath = path.join(ttsFolder,filename)
    console.log(`Downloaded to ${outputPath}`);

    await this.ttsService.speakToFile(text, outputPath);

    return {
       text: text,
       audioFilePath: `/tts-audio/${filename}` // public path to access the file
    };
  }

  @Get('delete-file')
  async deleteFile(@Query('filePath') filePath: string) {
    const ttsFolder = path.join('./', 'dist')
    const audioFile = path.join(ttsFolder, filePath);
    await rmSync(audioFile);
    return "File Deleted";
  }
}
