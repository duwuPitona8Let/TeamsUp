import {
  Controller,
  Get,
  Put,
  Post,
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
import { AdminService } from './admin.service';
import { CreateAdminDto, UpdateAdminDto } from '../dto';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // Управление пользователями
  @Get('users')
  async manageUsers() {
    return this.adminService.manageUsers();
  }

  @Get('users/:id')
  async getUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id/role')
  async changeRole(
    @Param('id', ParseIntPipe) id: number,
    @Query('role') role: UserRole,
  ) {
    return this.adminService.changeUserRole(id, role);
  }

  // Управление админами
  @Post('admins')
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.createAdmin(createAdminDto);
  }

  @Put('admins/:id')
  async updateAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    return this.adminService.updateAdmin(id, updateAdminDto);
  }

  @Delete('admins/:id')
  async deleteAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteAdmin(id);
  }

  // Конфигурация системы
  @Get('settings')
  async getSettings() {
    return this.adminService.getSystemSettings();
  }

  @Put('settings')
  async configureSystem(@Body() settings: Partial<any>) {
    return this.adminService.configureSystem(settings);
  }

  // Автоформирование команд
  @Post('teams/auto')
  async autoFormTeams() {
    return this.adminService.autoFormTeams();
  }
}
