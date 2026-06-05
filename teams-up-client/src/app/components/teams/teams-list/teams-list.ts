import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TeamService } from '../../../services/team.service';
import { AuthService } from '../../../services/auth.service';
import { Team, TeamStatus } from '../../../models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './teams-list.html',
  styleUrl: './teams-list.scss',
})
export class TeamsList implements OnInit {
  teams = signal<Team[]>([]);
  loading = signal(true);
  TeamStatus = TeamStatus;

  constructor(
    private teamService: TeamService,
    public authService: AuthService,
  ) {}

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams() {
    this.loading.set(true);
    this.teamService.getAllTeams().subscribe({
      next: (teams: Team[]) => {
        this.teams.set(teams);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  deleteTeam(id: number) {
    if (confirm('Вы уверены, что хотите удалить эту команду?')) {
      this.teamService.deleteTeam(id).subscribe({
        next: () => this.loadTeams(),
      });
    }
  }
}
