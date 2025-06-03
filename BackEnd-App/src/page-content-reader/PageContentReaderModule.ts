import { Module } from '@nestjs/common';
import PageContentReaderController from './PageContetReaderController';

@Module({
    controllers: [PageContentReaderController],
  })
export default class PageContentReaderModule{

}