import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { PiperManager } from './piper-manager';

@Controller('api/text-to-speech')
export class TtsController {
  constructor(private readonly ttsService: PiperManager) {}

  @Post('convert')
  async convertTextToSpeech(@Body('text') text: string) {
    return this.ttsService.speak(text);
  }

  @Get('convert')
  async convertTextToSpeechGet(@Query('text') text: string, @Res() res: Response) {
    const audio = await this.ttsService.speak(text);
    res.set({
      'Content-Type': 'audio/wav',
      'Content-Disposition': 'inline; filename="speech.wav"',
      'Content-Length': audio.length,
    });
    return res.send(audio);
  }
}
