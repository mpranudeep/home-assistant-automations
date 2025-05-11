import { Controller, Get, Query } from '@nestjs/common';

@Controller('page-content-reader')
export default class PageContentReaderController{


  @Get()
  handleUrl(@Query('inputURL') inputURL: string) {
    
  }
}