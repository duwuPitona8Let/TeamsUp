import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Admin } from '../entities/admin.entity';
import { Team, TeamStatus } from '../entities/team.entity';
import { Assignment } from '../entities/assignment.entity';
import { ProjectManager } from '../entities/project-manager.entity';
import { CreateAdminDto, UpdateAdminDto } from '../dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(ProjectManager)
    private pmRepository: Repository<ProjectManager>,
  ) {}

  // Управление пользователями
  async manageUsers() {
    const users = await this.userRepository.find({
      relations: ['assignments', 'assignments.team'],
    });
    return users.map(({ password, ...user }) => user);
  }

  async getUserById(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['assignments'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...result } = user;
    return result;
  }

  async changeUserRole(userId: number, newRole: UserRole) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = newRole;
    await this.userRepository.save(user);

    // Если назначаем админа, создаем запись в Admin
    if (newRole === UserRole.ADMIN) {
      const existingAdmin = await this.adminRepository.findOne({ where: { id: userId } });
      if (!existingAdmin) {
        const admin = this.adminRepository.create({ id: userId, rights: [], level: 1 });
        await this.adminRepository.save(admin);
      }
    }

    // Если назначаем PM, создаем запись в ProjectManager
    if (newRole === UserRole.PROJECT_MANAGER) {
      const existingPM = await this.pmRepository.findOne({ where: { id: userId } });
      if (!existingPM) {
        const pm = this.pmRepository.create({ id: userId, accessLevel: 'standard', projects: [] });
        await this.pmRepository.save(pm);
      }
    }

    return this.getUserById(userId);
  }

  // Управление админами
  async createAdmin(createAdminDto: CreateAdminDto) {
    const user = await this.userRepository.findOne({ where: { id: createAdminDto.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Обновляем роль пользователя
    user.role = UserRole.ADMIN;
    await this.userRepository.save(user);

    const admin = this.adminRepository.create({
      id: createAdminDto.userId,
      rights: createAdminDto.rights || [],
      level: createAdminDto.level || 1,
    });

    await this.adminRepository.save(admin);
    return admin;
  }

  async updateAdmin(adminId: number, updateAdminDto: UpdateAdminDto) {
    const admin = await this.adminRepository.findOne({ where: { id: adminId } });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    Object.assign(admin, updateAdminDto);
    await this.adminRepository.save(admin);
    return admin;
  }

  async deleteAdmin(adminId: number) {
    const admin = await this.adminRepository.findOne({ where: { id: adminId } });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    // Возвращаем роль пользователя к USER
    await this.userRepository.update(adminId, { role: UserRole.USER });
    await this.adminRepository.remove(admin);

    return { message: 'Admin deleted successfully' };
  }

  // Конфигурация системы
  private systemSettings: any = {
    maxTeamsPerUser: 5,
    autoAssignmentEnabled: false,
    minTeamSize: 2,
    maxTeamSize: 10,
  };

  async getSystemSettings() {
    return this.systemSettings;
  }

  async configureSystem(settings: Partial<any>) {
    Object.assign(this.systemSettings, settings);
    return this.systemSettings;
  }

  // Автоматическое формирование команд
  async autoFormTeams() {
    // Получаем всех пользователей без команды
    const usersWithoutTeams = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('assignment', 'assignment', 'assignment.userId = user.id')
      .where('assignment.id IS NULL')
      .getMany();

    if (usersWithoutTeams.length < this.systemSettings.minTeamSize) {
      throw new BadRequestException('Not enough users to form a team');
    }

    const teams: Team[] = [];
    const teamSize = this.systemSettings.maxTeamSize;

    for (let i = 0; i < usersWithoutTeams.length; i += teamSize) {
      const chunk = usersWithoutTeams.slice(i, i + teamSize);

      if (chunk.length >= this.systemSettings.minTeamSize) {
        const team = this.teamRepository.create({
          name: `Auto Team ${teams.length + 1}`,
          description: 'Automatically formed team',
          status: TeamStatus.ACTIVE,
        });

        await this.teamRepository.save(team);

        // Назначаем пользователей в команду
        for (const user of chunk) {
          const assignment = this.assignmentRepository.create({
            userId: user.id,
            teamId: team.id,
            role: 'member',
          });
          await this.assignmentRepository.save(assignment);
        }

        teams.push(team);
      }
    }

    return teams;
  }
}
