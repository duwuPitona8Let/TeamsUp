import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Assignment } from './assignment.entity';

export enum ApplicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int' })
  assignmentId: number;

  @Column({ type: 'varchar', length: 100 })
  candidateName: string;

  @Column({ type: 'varchar', length: 255 })
  candidateEmail: string;

  @Column({ type: 'text', nullable: true })
  coverLetter: string;

  @Column({
    type: 'simple-enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @ManyToOne(() => Assignment, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'assignmentId' })
  assignment: Assignment;
}
