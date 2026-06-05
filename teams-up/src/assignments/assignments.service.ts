import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from '../entities/assignment.entity';
import { User } from '../entities/user.entity';
import { Team } from '../entities/team.entity';
import { CreateAssignmentDto, UpdateAssignmentDto } from '../dto';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
  ) {}

  async assign(createAssignmentDto: CreateAssignmentDto) {
    const { userId, teamId, role, isVacant } = createAssignmentDto;

    // Проверяем существование команды
    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Если userId не указан, создаем вакантную позицию
    if (userId === null || userId === undefined || isVacant) {
      const assignment = this.assignmentRepository.create({
        teamId,
        role,
        isVacant: true,
      });

      await this.assignmentRepository.save(assignment);

      return this.findOne(assignment.id);
    }

    // Проверяем существование пользователя
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Проверяем, нет ли уже назначения этого пользователя в эту команду
    const existingAssignment = await this.assignmentRepository.findOne({
      where: { userId, teamId },
    });

    if (existingAssignment) {
      throw new BadRequestException('User is already assigned to this team');
    }

    const assignment = this.assignmentRepository.create({
      userId,
      teamId,
      role,
    });

    await this.assignmentRepository.save(assignment);

    return this.findOne(assignment.id);
  }

  async findOne(id: number) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
      relations: ['user', 'team'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return assignment;
  }

  async changeRole(id: number, updateAssignmentDto: UpdateAssignmentDto) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Если передан userId, назначаем пользователя на вакантную позицию
    if (updateAssignmentDto.userId !== undefined) {
      // Проверяем существование пользователя
      const user = await this.userRepository.findOne({
        where: { id: updateAssignmentDto.userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Проверяем, нет ли уже назначения этого пользователя в эту команду
      const existingAssignment = await this.assignmentRepository.findOne({
        where: {
          userId: updateAssignmentDto.userId,
          teamId: assignment.teamId,
        },
      });

      if (existingAssignment && existingAssignment.id !== id) {
        throw new BadRequestException('User is already assigned to this team');
      }

      assignment.userId = updateAssignmentDto.userId;
      assignment.isVacant = false;
    }

    // Если передана роль, обновляем её
    if (updateAssignmentDto.role !== undefined) {
      assignment.role = updateAssignmentDto.role;
    }

    // Если передан isVacant, обновляем его
    if (updateAssignmentDto.isVacant !== undefined) {
      assignment.isVacant = updateAssignmentDto.isVacant;
      if (updateAssignmentDto.isVacant) {
        assignment.userId = null;
      }
    }

    await this.assignmentRepository.save(assignment);

    return this.findOne(id);
  }

  async revoke(id: number) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    await this.assignmentRepository.remove(assignment);

    return { message: 'Assignment revoked successfully' };
  }

  async findByTeam(teamId: number) {
    return this.assignmentRepository.find({
      where: { teamId },
      relations: ['user'],
    });
  }

  async findByUser(userId: number) {
    return this.assignmentRepository.find({
      where: { userId },
      relations: ['team'],
    });
  }
}
