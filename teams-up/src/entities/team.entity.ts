import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Assignment } from './assignment.entity';

export enum TeamStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
}

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @CreateDateColumn({ type: 'datetime' })
  creationDate: Date;

  @Column({ type: 'simple-enum', enum: TeamStatus, default: TeamStatus.ACTIVE })
  status: TeamStatus;

  @OneToMany(() => Assignment, (assignment) => assignment.team)
  assignments: Assignment[];
}
