import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { Assignment } from '../entities/assignment.entity';
import { User } from '../entities/user.entity';
import { Team } from '../entities/team.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Assignment, User, Team])],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
