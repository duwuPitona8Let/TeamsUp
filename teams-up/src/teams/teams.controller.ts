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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { TeamsService } from './teams.service';
import { CreateTeamDto, UpdateTeamDto } from '../dto';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('teams')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  async createTeam(@Body() createTeamDto: CreateTeamDto, @CurrentUser() user: any) {
    return this.teamsService.create(createTeamDto);
  }

  @Get()
  async getAllTeams() {
    return this.teamsService.findAll();
  }

  @Get(':id')
  async getTeam(@Param('id', ParseIntPipe) id: number) {
    return this.teamsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  async updateTeam(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    return this.teamsService.update(id, updateTeamDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async deleteTeam(@Param('id', ParseIntPipe) id: number) {
    return this.teamsService.delete(id);
  }

  @Get(':id/members')
  async getMembers(@Param('id', ParseIntPipe) id: number) {
    return this.teamsService.getMembers(id);
  }

  @Get(':id/assignments')
  async getAssignments(@Param('id', ParseIntPipe) id: number) {
    return this.teamsService.getAssignments(id);
  }

  @Get(':id/stats')
  async getStats(@Param('id', ParseIntPipe) id: number) {
    return this.teamsService.getStats(id);
  }
}
