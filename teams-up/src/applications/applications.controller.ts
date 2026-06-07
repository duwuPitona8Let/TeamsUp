import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User, UserRole } from '../entities/user.entity';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from '../dto';

@Controller()
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  // Public — list of all open vacancies
  @Get('vacancies')
  getVacancies() {
    return this.applicationsService.getVacancies();
  }

  // Authenticated — personalized vacancy recommendations based on user history
  @Get('vacancies/recommended')
  @UseGuards(AuthGuard('jwt'))
  getRecommendedVacancies(@CurrentUser() user: User) {
    return this.applicationsService.getRecommendedVacancies(user);
  }

  // Public — submit application
  @Post('applications')
  apply(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.apply(dto);
  }

  // Recruiter / Admin — all applications
  @Get('applications')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  findAll() {
    return this.applicationsService.findAll();
  }

  // Recruiter / Admin — applications for a specific vacancy
  @Get('applications/vacancy/:assignmentId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  findByVacancy(@Param('assignmentId', ParseIntPipe) assignmentId: number) {
    return this.applicationsService.findByVacancy(assignmentId);
  }

  // Recruiter / Admin — accept application
  @Put('applications/:id/accept')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  accept(@Param('id', ParseIntPipe) id: number) {
    return this.applicationsService.accept(id);
  }

  // Recruiter / Admin — reject application
  @Put('applications/:id/reject')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.applicationsService.reject(id);
  }
}
