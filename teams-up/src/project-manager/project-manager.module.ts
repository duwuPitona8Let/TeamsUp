import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectManagerController } from './project-manager.controller';
import { ProjectManagerService } from './project-manager.service';
import { User } from '../entities/user.entity';
import { Team } from '../entities/team.entity';
import { Assignment } from '../entities/assignment.entity';
import { ProjectManager } from '../entities/project-manager.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Team, Assignment, ProjectManager])],
  controllers: [ProjectManagerController],
  providers: [ProjectManagerService],
  exports: [ProjectManagerService],
})
export class ProjectManagerModule {}
