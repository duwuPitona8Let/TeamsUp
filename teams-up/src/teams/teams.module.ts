import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { Team } from '../entities/team.entity';
import { Assignment } from '../entities/assignment.entity';
import { Application } from '../entities/application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Team, Assignment, Application])],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
