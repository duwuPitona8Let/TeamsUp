import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateUserDto } from '../dto';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { UserRole } from '../entities/user.entity';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  async getUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    // Пользователь может смотреть только свой профиль или админ может смотреть всех
    if (user.id !== id && user.role !== UserRole.ADMIN) {
      return this.usersService.findById(user.id);
    }
    return this.usersService.findById(id);
  }

  @Put(':id')
  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    // Пользователь может редактировать только свой профиль
    if (user.id !== id) {
      return this.usersService.updateProfile(user.id, updateUserDto);
    }
    return this.usersService.updateProfile(id, updateUserDto);
  }

  @Get(':id/teams')
  async viewTeams(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    // Пользователь может смотреть только свои команды
    if (user.id !== id && user.role !== UserRole.ADMIN) {
      return this.usersService.viewTeams(user.id);
    }
    return this.usersService.viewTeams(id);
  }

  @Get()
  async searchUsers(@Query('q') query: string) {
    return this.usersService.searchUsers(query);
  }
}
