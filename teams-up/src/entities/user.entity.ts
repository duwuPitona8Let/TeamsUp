import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Assignment } from './assignment.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  PROJECT_MANAGER = 'project_manager',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @CreateDateColumn({ type: 'datetime' })
  registrationDate: Date;

  @Column({ type: 'simple-enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @OneToMany(() => Assignment, (assignment) => assignment.user)
  assignments: Assignment[];
}
