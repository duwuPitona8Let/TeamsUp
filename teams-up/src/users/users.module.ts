import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { Assignment } from '../entities/assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Assignment])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
