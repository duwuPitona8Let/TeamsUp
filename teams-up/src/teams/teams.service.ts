import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../entities/team.entity';
import { Assignment } from '../entities/assignment.entity';
import { Application, ApplicationStatus } from '../entities/application.entity';
import { CreateTeamDto, UpdateTeamDto } from '../dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
  ) {}

  async create(createTeamDto: CreateTeamDto) {
    const team = this.teamRepository.create(createTeamDto);
    await this.teamRepository.save(team);
    return team;
  }

  async findAll() {
    return this.teamRepository.find({
      relations: ['assignments', 'assignments.user'],
    });
  }

  async findOne(id: number) {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['assignments', 'assignments.user'],
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async update(id: number, updateTeamDto: UpdateTeamDto) {
    const team = await this.teamRepository.findOne({ where: { id } });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    Object.assign(team, updateTeamDto);
    await this.teamRepository.save(team);
    return team;
  }

  async delete(id: number) {
    const team = await this.teamRepository.findOne({ where: { id } });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    await this.teamRepository.remove(team);
    return { message: 'Team deleted successfully' };
  }

  async getMembers(teamId: number) {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['assignments', 'assignments.user'],
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team.assignments.map((assignment) => ({
      id: assignment.user?.id || null,
      name: assignment.user?.name || 'Вакансия',
      email: assignment.user?.email || null,
      role: assignment.role,
      assignmentDate: assignment.assignmentDate,
      isVacant: assignment.isVacant,
    }));
  }

  async getAssignments(teamId: number) {
    const assignments = await this.assignmentRepository.find({
      where: { teamId },
      relations: ['user'],
    });

    return assignments;
  }

  async getStats(teamId: number) {
    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');

    const assignments = await this.assignmentRepository.find({
      where: { teamId },
      relations: ['user'],
    });

    const filled = assignments.filter((a) => !a.isVacant);
    const vacant = assignments.filter((a) => a.isVacant);

    // Разбивка по ролям
    const rolesMap: Record<string, { total: number; filled: number }> = {};
    for (const a of assignments) {
      if (!rolesMap[a.role]) rolesMap[a.role] = { total: 0, filled: 0 };
      rolesMap[a.role].total++;
      if (!a.isVacant) rolesMap[a.role].filled++;
    }
    const roles = Object.entries(rolesMap).map(([role, data]) => ({ role, ...data }));

    // Отклики на все вакансии этой команды
    const vacancyIds = vacant.map((a) => a.id);
    let appStats = { total: 0, pending: 0, accepted: 0, rejected: 0 };

    if (vacancyIds.length > 0) {
      const apps = await this.applicationRepository
        .createQueryBuilder('app')
        .where('app.assignmentId IN (:...ids)', { ids: vacancyIds })
        .getMany();

      appStats = {
        total: apps.length,
        pending: apps.filter((a) => a.status === ApplicationStatus.PENDING).length,
        accepted: apps.filter((a) => a.status === ApplicationStatus.ACCEPTED).length,
        rejected: apps.filter((a) => a.status === ApplicationStatus.REJECTED).length,
      };
    }

    return {
      team,
      positions: {
        total: assignments.length,
        filled: filled.length,
        vacant: vacant.length,
        completionRate: assignments.length
          ? Math.round((filled.length / assignments.length) * 100)
          : 0,
      },
      roles,
      applications: appStats,
    };
  }
}
