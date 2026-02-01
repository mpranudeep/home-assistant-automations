export interface NovelSource {
  id: string; // unique identifier for the source within the novel
  name: string;
  translateEnabled: boolean;
  refinementEnabled: boolean;
  // For possible extension: add source-specific info here
}

export interface UserChapterProgress {
  [userId: string]: string; // userId -> currentChapterId or number
}

export interface Novel {
  id: string; // unique identifier for the novel
  name: string;
  sources: NovelSource[];
  // key: sourceId, value: UserChapterProgress
  chapterProgress?: {
    [sourceId: string]: UserChapterProgress;
  };
}

// DTOs for input validation (expand as needed)
export class CreateNovelDto {
  name!: string;
}

export class UpdateNovelDto {
  name?: string;
}

export class CreateNovelSourceDto {
  name!: string;
  translateEnabled?: boolean;
  refinementEnabled?: boolean;
}

export class UpdateNovelSourceDto {
  name?: string;
  translateEnabled?: boolean;
  refinementEnabled?: boolean;
}

// For setting/getting current chapter
export class SetCurrentChapterDto {
  userId!: string;
  chapter!: string;
}