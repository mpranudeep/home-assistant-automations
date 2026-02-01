import { Controller, Get, Post, Put, Delete, Param, Body, Query, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Novel } from './entities/Novel';
import { Source } from './entities/Source';
import { ChapterProgress } from './entities/ChapterProgress';
import {
  CreateNovelDto,
  UpdateNovelDto,
  CreateNovelSourceDto,
  UpdateNovelSourceDto,
  SetCurrentChapterDto,
} from './NovelSource.dto';

@Controller('novels')
export class NovelSourceController {
  constructor(
    @InjectRepository(Novel)
    private novelsRepo: Repository<Novel>,

    @InjectRepository(Source)
    private sourcesRepo: Repository<Source>,

    @InjectRepository(ChapterProgress)
    private progressRepo: Repository<ChapterProgress>,
  ) {}

  // --- Novel CRUD ---
  @Get()
  async getAllNovels(): Promise<Novel[]> {
    return this.novelsRepo.find({ relations: ['sources'] });
  }

  @Post()
  async addNovel(@Body() dto: CreateNovelDto): Promise<Novel> {
    const novel = this.novelsRepo.create({ name: dto.name });
    return this.novelsRepo.save(novel);
  }

  @Put(':novelId')
  async updateNovel(@Param('novelId') novelId: string, @Body() dto: UpdateNovelDto): Promise<Novel> {
    const found = await this.novelsRepo.findOne({ where: { id: novelId } });
    if (!found) throw new NotFoundException('Novel not found');
    if (dto.name !== undefined) found.name = dto.name;
    return this.novelsRepo.save(found);
  }

  @Delete(':novelId')
  async deleteNovel(@Param('novelId') novelId: string) {
    const found = await this.novelsRepo.findOne({ where: { id: novelId } });
    if (!found) throw new NotFoundException('Novel not found');
    await this.novelsRepo.remove(found);
    return { deleted: true };
  }

  // --- Source CRUD under a novel ---

  @Get(':novelId/sources')
  async listSources(@Param('novelId') novelId: string): Promise<Source[]> {
    const novel = await this.novelsRepo.findOne({ where: { id: novelId }, relations: ['sources'] });
    if (!novel) throw new NotFoundException('Novel not found');
    return novel.sources || [];
  }

  @Post(':novelId/sources')
  async addSource(@Param('novelId') novelId: string, @Body() dto: CreateNovelSourceDto): Promise<Source> {
    const novel = await this.novelsRepo.findOne({ where: { id: novelId }, relations: ['sources'] });
    if (!novel) throw new NotFoundException('Novel not found');
    const source = this.sourcesRepo.create({
      name: dto.name,
      translateEnabled: !!dto.translateEnabled,
      refinementEnabled: !!dto.refinementEnabled,
      novel: novel
    });
    return this.sourcesRepo.save(source);
  }

  @Put(':novelId/sources/:sourceId')
  async updateSource(
    @Param('novelId') novelId: string,
    @Param('sourceId') sourceId: string,
    @Body() dto: UpdateNovelSourceDto
  ): Promise<Source> {
    const source = await this.sourcesRepo.findOne({ where: { id: sourceId }, relations: ['novel'] });
    if (!source || !source.novel || source.novel.id !== novelId) throw new NotFoundException('Source not found');
    if (dto.name !== undefined) source.name = dto.name;
    if (dto.translateEnabled !== undefined) source.translateEnabled = dto.translateEnabled;
    if (dto.refinementEnabled !== undefined) source.refinementEnabled = dto.refinementEnabled;
    return this.sourcesRepo.save(source);
  }

  @Delete(':novelId/sources/:sourceId')
  async deleteSource(
    @Param('novelId') novelId: string,
    @Param('sourceId') sourceId: string
  ) {
    const source = await this.sourcesRepo.findOne({ where: { id: sourceId }, relations: ['novel'] });
    if (!source || !source.novel || source.novel.id !== novelId) throw new NotFoundException('Source not found');
    await this.sourcesRepo.remove(source);
    return { deleted: true };
  }

  // --- Persistent Per-user chapter progress ---

  @Post(':novelId/sources/:sourceId/chapter')
  async setCurrentChapter(
    @Param('novelId') novelId: string,
    @Param('sourceId') sourceId: string,
    @Body() dto: SetCurrentChapterDto
  ) {
    const userId = dto.userId?.trim();
    const chapter = dto.chapter;
    if (!userId || chapter === undefined) {
      throw new BadRequestException('userId and chapter are required');
    }
    const novel = await this.novelsRepo.findOne({ where: { id: novelId } });
    if (!novel) throw new NotFoundException('Novel not found');
    const source = await this.sourcesRepo.findOne({ where: { id: sourceId }, relations: ['novel'] });
    if (!source || !source.novel || source.novel.id !== novelId) throw new NotFoundException('Source not found');
    
    let progress = await this.progressRepo.findOne({
      where: { userId, novel: { id: novelId }, source: { id: sourceId } },
      relations: ['novel', 'source']
    });
    if (progress) {
      progress.chapter = chapter;
    } else {
      progress = this.progressRepo.create({
        userId,
        chapter,
        novel,
        source
      });
    }
    await this.progressRepo.save(progress);
    return { userId, chapter };
  }

  @Get(':novelId/sources/:sourceId/chapter')
  async getCurrentChapter(
    @Param('novelId') novelId: string,
    @Param('sourceId') sourceId: string,
    @Query('userId') userId: string
  ) {
    if (!userId) throw new BadRequestException('userId is required');
    const progress = await this.progressRepo.findOne({
      where: { userId, novel: { id: novelId }, source: { id: sourceId } },
      relations: ['novel', 'source']
    });
    return { userId, chapter: progress ? progress.chapter : null };
  }
}