import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { Application } from '../entities/application.entity';
import { Assignment } from '../entities/assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Application, Assignment])],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
