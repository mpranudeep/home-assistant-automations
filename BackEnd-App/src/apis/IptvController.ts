import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import axios from 'axios';
import Constants from '../common/Constants';
import { Logger } from '@nestjs/common';

@Controller()
export class IptvController {

  private readonly logger = new Logger(IptvController.name);

  @Get('iptv/halltv.m3u')
  async getPlaylist(
    @Res() res: Response,
  ) {
    try {
    
      let url = `${Constants.JIO_TV_URL}/playlist.m3u?l=Hindi,Telugu,English`

      this.logger.debug(`Redirecting to ${url}`);

      const response = await axios.get(url, { responseType: 'text' });

      let content = response.data as string;

      res.setHeader('Content-Type', 'audio/x-mpegurl');
      return res.send(content);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Failed to fetch or parse playlist.');
    }
  }
}
