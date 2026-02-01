import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Novel } from './Novel';

@Entity()
export class Source {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ default: false })
  translateEnabled!: boolean;

  @Column({ default: false })
  refinementEnabled!: boolean;

  @ManyToOne(() => Novel, (novel) => novel.sources, { onDelete: 'CASCADE' })
  novel!: Novel;
}