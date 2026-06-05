import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../../services/team.service';
import { Team, TeamStatus } from '../../../models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-team-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team-form.html',
  styleUrl: './team-form.scss',
})
export class TeamForm implements OnInit {
  team = signal<Team | null>(null);
  name = signal('');
  description = signal('');
  status = signal<TeamStatus>(TeamStatus.ACTIVE);
  loading = signal(false);
  error = signal('');
  isEdit = false;

  TeamStatus = TeamStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.loadTeam(Number(id));
    }
  }

  loadTeam(id: number) {
    this.teamService.getTeam(id).subscribe({
      next: (team: Team) => {
        this.team.set(team);
        this.name.set(team.name);
        this.description.set(team.description);
        this.status.set(team.status);
      },
    });
  }

  onSubmit() {
    this.error.set('');
    this.loading.set(true);

    const dto = {
      name: this.name(),
      description: this.description(),
      status: this.status(),
    };

    if (this.isEdit && this.team()) {
      this.teamService.updateTeam(this.team()!.id, dto).subscribe({
        next: () => this.router.navigate(['/teams', this.team()!.id]),
        error: (err: any) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Ошибка обновления');
        },
      });
    } else {
      this.teamService.createTeam(dto).subscribe({
        next: (newTeam: Team) => this.router.navigate(['/teams', newTeam.id]),
        error: (err: any) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Ошибка создания');
        },
      });
    }
  }
}
