import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../entities/user.entity';
import { Admin } from '../entities/admin.entity';
import { Team } from '../entities/team.entity';
import { Assignment } from '../entities/assignment.entity';
import { ProjectManager } from '../entities/project-manager.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Admin, Team, Assignment, ProjectManager])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
