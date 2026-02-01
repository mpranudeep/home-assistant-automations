import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Novel } from './Novel';
import { Source } from './Source';

@Entity()
@Index(['userId', 'novel', 'source'], { unique: true })
export class ChapterProgress {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  chapter!: string;

  @ManyToOne(() => Novel, { onDelete: 'CASCADE' })
  novel!: Novel;

  @ManyToOne(() => Source, { onDelete: 'CASCADE' })
  source!: Source;
}