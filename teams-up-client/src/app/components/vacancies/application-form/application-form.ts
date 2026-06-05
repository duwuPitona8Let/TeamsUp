import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApplicationService } from '../../../services/application.service';
import { Vacancy } from '../../../models';

@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './application-form.html',
  styleUrl: './application-form.scss',
})
export class ApplicationForm implements OnInit {
  vacancy = signal<Vacancy | null>(null);
  loading = signal(true);
  submitting = signal(false);
  submitted = signal(false);
  error = signal('');

  form = {
    candidateName: '',
    candidateEmail: '',
    coverLetter: '',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService,
  ) {}

  ngOnInit() {
    const vacancyId = Number(this.route.snapshot.paramMap.get('id'));
    this.applicationService.getVacancies().subscribe({
      next: (vacancies) => {
        const found = vacancies.find((v) => v.id === vacancyId) ?? null;
        this.vacancy.set(found);
        this.loading.set(false);
        if (!found) this.error.set('Вакансия не найдена или уже закрыта');
      },
      error: () => {
        this.error.set('Ошибка загрузки вакансии');
        this.loading.set(false);
      },
    });
  }

  submit() {
    if (!this.form.candidateName.trim() || !this.form.candidateEmail.trim()) return;
    const v = this.vacancy();
    if (!v) return;

    this.submitting.set(true);
    this.error.set('');

    this.applicationService
      .submitApplication({
        assignmentId: v.id,
        candidateName: this.form.candidateName.trim(),
        candidateEmail: this.form.candidateEmail.trim(),
        coverLetter: this.form.coverLetter.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.submitted.set(true);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err.error?.message ?? 'Ошибка при отправке отклика');
        },
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
