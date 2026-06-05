import { Entity, Column, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('admins')
export class Admin {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'simple-array', default: '' })
  rights: string[];

  @Column({ type: 'int', default: 1 })
  level: number;
}
