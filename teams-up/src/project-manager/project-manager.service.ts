import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Team, TeamStatus } from '../entities/team.entity';
import { Assignment } from '../entities/assignment.entity';
import { ProjectManager } from '../entities/project-manager.entity';
import { CreateTeamDto, CreateAssignmentDto } from '../dto';

// Интерфейс для оценки навыков
export interface SkillAssessment {
  userId: number;
  skills: Record<string, number>;
}

@Injectable()
export class ProjectManagerService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(ProjectManager)
    private pmRepository: Repository<ProjectManager>,
  ) {}

  // Проверка, является ли пользователь PM
  private async isProjectManager(userId: number): Promise<ProjectManager> {
    const pm = await this.pmRepository.findOne({ where: { id: userId } });
    if (!pm) {
      throw new ForbiddenException(
        'Only project managers can perform this action',
      );
    }
    return pm;
  }

  // Создание команды
  async createTeam(userId: number, createTeamDto: CreateTeamDto) {
    await this.isProjectManager(userId);

    const team = this.teamRepository.create({
      ...createTeamDto,
      status: createTeamDto.status || TeamStatus.ACTIVE,
    });

    await this.teamRepository.save(team);

    // Добавляем PM как участника команды с ролью manager
    const assignment = this.assignmentRepository.create({
      userId,
      teamId: team.id,
      role: 'manager',
    });
    await this.assignmentRepository.save(assignment);

    // Обновляем список проектов PM
    const pm = await this.pmRepository.findOne({ where: { id: userId } });
    if (pm && !pm.projects.includes(`team-${team.id}`)) {
      pm.projects.push(`team-${team.id}`);
      await this.pmRepository.save(pm);
    }

    return team;
  }

  // Поиск участников по навыкам (в данной реализации - по роли в назначениях)
  async findMembers(filters?: { role?: string; teamId?: number }) {
    let query = this.userRepository
      .createQueryBuilder('user')
      .leftJoin('assignment', 'assignment', 'assignment.userId = user.id')
      .select([
        'user.id',
        'user.name',
        'user.email',
        'assignment.role',
        'assignment.teamId',
      ]);

    if (filters?.role) {
      query = query.andWhere('assignment.role = :role', { role: filters.role });
    }

    if (filters?.teamId) {
      query = query.andWhere('assignment.teamId = :teamId', {
        teamId: filters.teamId,
      });
    }

    return query.getMany();
  }

  // Оценка навыков (сохраняем в виде metadata или обновляем роль)
  // В данной реализации создаем запись с навыками в виде JSON
  private skillsStorage: Map<number, SkillAssessment> = new Map();

  async assessSkills(userId: number, skills: Record<string, number>) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const assessment: SkillAssessment = { userId, skills };
    this.skillsStorage.set(userId, assessment);

    return {
      message: 'Skills assessed successfully',
      userId,
      skills,
    };
  }

  getSkills(userId: number): SkillAssessment | null {
    return this.skillsStorage.get(userId) || null;
  }

  // Назначение роли
  async assignRole(pmId: number, createAssignmentDto: CreateAssignmentDto) {
    await this.isProjectManager(pmId);

    const { userId, teamId, role, isVacant } = createAssignmentDto;

    // Если вакантная позиция
    if (userId === null || userId === undefined || isVacant) {
      const team = await this.teamRepository.findOne({ where: { id: teamId } });
      if (!team) {
        throw new NotFoundException('Team not found');
      }

      const assignment = this.assignmentRepository.create({
        teamId,
        role,
        isVacant: true,
      });
      await this.assignmentRepository.save(assignment);

      return this.assignmentRepository.findOne({
        where: { id: assignment.id },
        relations: ['team'],
      });
    }

    // Проверяем существование пользователя и команды
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Проверяем, есть ли уже назначение
    let assignment = await this.assignmentRepository.findOne({
      where: { userId, teamId },
    });

    if (assignment) {
      // Обновляем роль
      assignment.role = role;
      await this.assignmentRepository.save(assignment);
    } else {
      // Создаем новое назначение
      assignment = this.assignmentRepository.create({
        userId,
        teamId,
        role,
      });
      await this.assignmentRepository.save(assignment);
    }

    return this.assignmentRepository.findOne({
      where: { id: assignment.id },
      relations: ['user', 'team'],
    });
  }

  // Получить все команды PM
  async getMyTeams(pmId: number) {
    await this.isProjectManager(pmId);

    const pm = await this.pmRepository.findOne({ where: { id: pmId } });

    if (!pm || pm.projects.length === 0) {
      return [];
    }

    const teamIds = pm.projects
      .filter((p: string) => p.startsWith('team-'))
      .map((p: string) => parseInt(p.replace('team-', ''), 10));

    if (teamIds.length === 0) {
      return [];
    }

    return this.teamRepository.findByIds(teamIds);
  }
}
