import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Source } from './Source';

@Entity()
export class Novel {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  name?: string;

  @OneToMany(() => Source, (source) => source.novel, { cascade: true })
  sources?: Source[];
}