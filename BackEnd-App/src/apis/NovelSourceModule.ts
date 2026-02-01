import { Module } from '@nestjs/common';
import { NovelSourceController } from './NovelSourceController';

@Module({
  controllers: [NovelSourceController],
})
export class NovelSourceModule {}