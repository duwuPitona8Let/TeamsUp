import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from '../entities/application.entity';
import { Assignment } from '../entities/assignment.entity';
import { CreateApplicationDto } from '../dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
  ) {}

  async getVacancies() {
    return this.assignmentRepository.find({
      where: { isVacant: true },
      relations: ['team'],
    });
  }

  async apply(dto: CreateApplicationDto) {
    const vacancy = await this.assignmentRepository.findOne({
      where: { id: dto.assignmentId, isVacant: true },
    });

    if (!vacancy) {
      throw new NotFoundException('Vacancy not found or already filled');
    }

    const existing = await this.applicationRepository.findOne({
      where: {
        assignmentId: dto.assignmentId,
        candidateEmail: dto.candidateEmail,
      },
    });

    if (existing) {
      throw new BadRequestException('You already applied to this vacancy');
    }

    const application = this.applicationRepository.create(dto);
    return this.applicationRepository.save(application);
  }

  async findAll() {
    return this.applicationRepository.find({
      relations: ['assignment', 'assignment.team'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByVacancy(assignmentId: number) {
    return this.applicationRepository.find({
      where: { assignmentId },
      order: { createdAt: 'DESC' },
    });
  }

  async accept(id: number) {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['assignment', 'assignment.team'],
    });

    if (!application) throw new NotFoundException('Application not found');
    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Application already reviewed');
    }

    application.status = ApplicationStatus.ACCEPTED;
    await this.applicationRepository.save(application);

    // Assign candidate to the vacancy position
    const vacancy = await this.assignmentRepository.findOne({
      where: { id: application.assignmentId },
    });

    if (vacancy && vacancy.isVacant) {
      vacancy.isVacant = false;
      await this.assignmentRepository.save(vacancy);

      // Reject all other pending applications for same vacancy
      await this.applicationRepository
        .createQueryBuilder()
        .update(Application)
        .set({ status: ApplicationStatus.REJECTED })
        .where('assignmentId = :aid AND id != :id AND status = :status', {
          aid: application.assignmentId,
          id,
          status: ApplicationStatus.PENDING,
        })
        .execute();
    }

    return this.applicationRepository.findOne({
      where: { id },
      relations: ['assignment', 'assignment.team'],
    });
  }

  async reject(id: number) {
    const application = await this.applicationRepository.findOne({
      where: { id },
    });

    if (!application) throw new NotFoundException('Application not found');
    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Application already reviewed');
    }

    application.status = ApplicationStatus.REJECTED;
    return this.applicationRepository.save(application);
  }
}
