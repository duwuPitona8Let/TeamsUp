import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('project_managers')
export class ProjectManager {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 50, default: 'standard' })
  accessLevel: string;

  @Column({ type: 'simple-array', default: '' })
  projects: string[];
}
