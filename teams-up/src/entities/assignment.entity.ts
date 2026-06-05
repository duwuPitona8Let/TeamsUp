import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Team } from './team.entity';

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int', nullable: true })
  userId: number | null;

  @Column({ type: 'int' })
  teamId: number;

  @Column({ type: 'varchar', length: 50 })
  role: string;

  @CreateDateColumn({ type: 'datetime' })
  assignmentDate: Date;

  @Column({ type: 'boolean', default: false })
  isVacant: boolean;

  @ManyToOne(() => User, (user) => user.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @ManyToOne(() => Team, (team) => team.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  team: Team;
}
