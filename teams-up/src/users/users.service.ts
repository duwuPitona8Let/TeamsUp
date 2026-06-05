import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Assignment } from '../entities/assignment.entity';
import { UpdateUserDto } from '../dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
  ) {}

  async findById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['assignments', 'assignments.team'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async updateProfile(userId: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);

    const { password, ...result } = user;
    return result;
  }

  async viewTeams(userId: number) {
    const assignments = await this.assignmentRepository.find({
      where: { userId },
      relations: ['team'],
    });

    return assignments.map((assignment) => ({
      team: assignment.team,
      role: assignment.role,
      assignmentDate: assignment.assignmentDate,
    }));
  }

  async findAll() {
    const users = await this.userRepository.find({
      relations: ['assignments'],
    });
    return users.map(({ password, ...user }) => user);
  }

  async searchUsers(query: string) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.name ILIKE :query', { query: `%${query}%` })
      .orWhere('user.email ILIKE :query', { query: `%${query}%` })
      .select(['user.id', 'user.name', 'user.email', 'user.role'])
      .limit(10)
      .getMany();

    return users;
  }
}
