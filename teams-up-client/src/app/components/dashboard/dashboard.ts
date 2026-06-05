import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TeamService } from '../../services/team.service';
import { UserService } from '../../services/user.service';
import { Team, User } from '../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  teams = signal<Team[]>([]);
  users = signal<User[]>([]);
  loading = signal(true);

  constructor(
    public authService: AuthService,
    private teamService: TeamService,
    private userService: UserService,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);

    this.teamService.getAllTeams().subscribe({
      next: (teams) => {
        this.teams.set(teams);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    if (this.authService.isAdmin()) {
      this.userService.getAllUsers().subscribe({
        next: (users) => this.users.set(users),
      });
    }
  }
}
