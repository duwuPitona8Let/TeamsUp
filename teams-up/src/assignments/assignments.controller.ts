import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto, UpdateAssignmentDto } from '../dto';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('assignments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AssignmentsController {
  constructor(private assignmentsService: AssignmentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  async assign(@Body() createAssignmentDto: CreateAssignmentDto) {
    return this.assignmentsService.assign(createAssignmentDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  async changeRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
  ) {
    return this.assignmentsService.changeRole(id, updateAssignmentDto);
  }

  @Post(':id/assign')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  async assignToVacant(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userId: number; role?: string },
  ) {
    return this.assignmentsService.changeRole(id, {
      userId: body.userId,
      role: body.role,
    });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  async revoke(@Param('id', ParseIntPipe) id: number) {
    return this.assignmentsService.revoke(id);
  }

  @Get(':id')
  async getAssignment(@Param('id', ParseIntPipe) id: number) {
    return this.assignmentsService.findOne(id);
  }

  // Получение всех назначений команды
  @Get('teams/:teamId')
  async getByTeam(@Param('teamId', ParseIntPipe) teamId: number) {
    return this.assignmentsService.findByTeam(teamId);
  }

  // Получение всех назначений пользователя
  @Get('users/:userId')
  async getByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: any,
  ) {
    // Пользователь может смотреть только свои назначения или админ/PM может смотреть все
    if (
      user.id !== userId &&
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.PROJECT_MANAGER
    ) {
      return this.assignmentsService.findByUser(user.id);
    }
    return this.assignmentsService.findByUser(userId);
  }
}
