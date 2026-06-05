import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { TeamsModule } from './teams/teams.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { ProjectManagerModule } from './project-manager/project-manager.module';
import { ApplicationsModule } from './applications/applications.module';
import configuration from './config/configuration';
import { User } from './entities/user.entity';
import { Team } from './entities/team.entity';
import { Assignment } from './entities/assignment.entity';
import { Admin } from './entities/admin.entity';
import { ProjectManager } from './entities/project-manager.entity';
import { Application } from './entities/application.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get<string>('database.path'),
        entities: [User, Team, Assignment, Admin, ProjectManager, Application],
        synchronize: true, // Только для разработки!
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    AdminModule,
    TeamsModule,
    AssignmentsModule,
    ProjectManagerModule,
    ApplicationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
