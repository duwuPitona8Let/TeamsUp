import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../../services/application.service';
import { Application, ApplicationStatus } from '../../../models';

@Component({
  selector: 'app-recruiter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recruiter-panel.html',
  styleUrl: './recruiter-panel.scss',
})
export class RecruiterPanel implements OnInit {
  applications = signal<Application[]>([]);
  loading = signal(true);
  filterStatus = signal<string>('all');
  ApplicationStatus = ApplicationStatus;

  filtered = computed(() => {
    const all = this.applications();
    const status = this.filterStatus();
    if (status === 'all') return all;
    return all.filter((a) => a.status === status);
  });

  pending = computed(() => this.applications().filter((a) => a.status === ApplicationStatus.PENDING).length);

  constructor(private applicationService: ApplicationService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.applicationService.getAllApplications().subscribe({
      next: (apps) => {
        this.applications.set(apps);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  accept(id: number) {
    this.applicationService.acceptApplication(id).subscribe({
      next: () => this.load(),
    });
  }

  reject(id: number) {
    this.applicationService.rejectApplication(id).subscribe({
      next: () => this.load(),
    });
  }

  roleLabel(role: string): string {
    const map: Record<string, string> = {
      developer: 'Разработчик',
      designer: 'Дизайнер',
      tester: 'Тестировщик',
      analyst: 'Аналитик',
    };
    return map[role] ?? role;
  }
}
