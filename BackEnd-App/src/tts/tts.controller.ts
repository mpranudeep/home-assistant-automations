import { Body, Controller, Get, Post, Query,Res } from '@nestjs/common';
import { PiperManager } from './piper-manager';
import * as path from 'path';
import { fstat, rmSync, unlink} from 'fs';
import * as fs from 'fs';
import { mkdir } from 'fs/promises';
import { parse } from 'url';
import { basename } from 'path';
import { Response } from 'express';


@Controller('api/text-to-speech')
export class TtsController {
  

  constructor(private readonly ttsService: PiperManager) {}

  @Post('convert')
  async convertTextToSpeech(@Body('text') text: string) {
    let filePath = await this.ttsService.speakToFile(text);

    let fileName = path.basename(filePath);

    return {
       text: text,
       audioFilePath: `/tts-audio/${fileName}` // public path to access the file
    };
  }


@Get('convert')
async convertTextToSpeechGet(
  @Query('text') text: string,
  @Res() res: Response
) {
  const filePath = await this.ttsService.speakToFile(text);

  const fileName = path.basename(filePath);

  res.set({
    'Content-Type': 'audio/wav',
    'Content-Disposition': `inline; filename="${fileName}"`,
  });

  const stream = fs.createReadStream(filePath);
  return stream.pipe(res);
}

  @Get('delete-file')
  async deleteFile(@Query('filePath') filePath: string) {
    const ttsFolder = path.join('./', 'dist', 'tts-audio')
    // Get the pathname part of the URL
    
    const pathname = parse(filePath).pathname;

    if(pathname){
    // Extract the file name using path.basename
      const fileName = path.basename(pathname);

      const audioFile = path.join(ttsFolder, fileName);
      await rmSync(audioFile);
    }
    return "File Deleted";
  }
}
