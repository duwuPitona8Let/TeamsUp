import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApplicationService } from '../../../services/application.service';
import { AuthService } from '../../../services/auth.service';
import { Vacancy } from '../../../models';

@Component({
  selector: 'app-vacancies-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './vacancies-list.html',
  styleUrl: './vacancies-list.scss',
})
export class VacanciesList implements OnInit {
  vacancies = signal<Vacancy[]>([]);
  recommended = signal<Vacancy[]>([]);
  loading = signal(true);

  constructor(
    private applicationService: ApplicationService,
    public authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.applicationService.getVacancies().subscribe({
      next: (v) => {
        this.vacancies.set(v);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    if (this.authService.isAuthenticated()) {
      this.applicationService.getRecommendedVacancies().subscribe({
        next: (v) => this.recommended.set(v),
        error: () => {},
      });
    }
  }

  applyTo(vacancy: Vacancy) {
    this.router.navigate(['/vacancies', vacancy.id, 'apply']);
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
