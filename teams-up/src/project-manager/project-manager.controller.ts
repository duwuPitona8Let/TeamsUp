import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { ProjectManagerService } from './project-manager.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CreateTeamDto, CreateAssignmentDto } from '../dto';

@Controller('manager')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.PROJECT_MANAGER)
export class ProjectManagerController {
  constructor(private pmService: ProjectManagerService) {}

  // Создание команды
  @Post('teams')
  async createTeam(@Body() createTeamDto: CreateTeamDto, @CurrentUser() user: any) {
    return this.pmService.createTeam(user.id, createTeamDto);
  }

  // Получить мои команды
  @Get('teams')
  async getMyTeams(@CurrentUser() user: any) {
    return this.pmService.getMyTeams(user.id);
  }

  // Поиск участников
  @Get('members')
  async findMembers(
    @Query('role') role?: string,
    @Query('teamId', ParseIntPipe) teamId?: number,
  ) {
    return this.pmService.findMembers({ role, teamId });
  }

  // Оценка навыков
  @Post('skills/assess')
  async assessSkills(
    @Body('userId', ParseIntPipe) userId: number,
    @Body('skills') skills: Record<string, number>,
  ) {
    return this.pmService.assessSkills(userId, skills);
  }

  @Get('skills/:userId')
  async getSkills(@Param('userId', ParseIntPipe) userId: number) {
    return this.pmService.getSkills(userId);
  }

  // Назначение роли
  @Post('assignments')
  async assignRole(
    @Body() createAssignmentDto: CreateAssignmentDto,
    @CurrentUser() user: any,
  ) {
    return this.pmService.assignRole(user.id, createAssignmentDto);
  }
}
