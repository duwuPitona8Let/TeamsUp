import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss',
})
export class UserDetail implements OnInit {
  user = signal<User | null>(null);
  teams = signal<any[]>([]);
  loading = signal(true);
  isEditing = signal(false);
  editName = signal('');
  editEmail = signal('');

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    public authService: AuthService,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadUser(id);
    this.loadTeams(id);
  }

  loadUser(id: number) {
    this.userService.getUser(id).subscribe({
      next: (user: User) => {
        this.user.set(user);
        this.editName.set(user.name);
        this.editEmail.set(user.email);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadTeams(id: number) {
    this.userService.getUserTeams(id).subscribe({
      next: (teams: any[]) => this.teams.set(teams),
    });
  }

  toggleEdit() {
    if (this.isEditing()) {
      this.cancelEdit();
    } else {
      this.isEditing.set(true);
    }
  }

  cancelEdit() {
    const u = this.user();
    if (u) {
      this.editName.set(u.name);
      this.editEmail.set(u.email);
    }
    this.isEditing.set(false);
  }

  saveChanges() {
    const u = this.user();
    if (!u) return;

    this.userService
      .updateUser(u.id, {
        name: this.editName(),
        email: this.editEmail(),
      })
      .subscribe({
        next: (updated: User) => {
          this.user.set(updated);
          this.isEditing.set(false);
        },
      });
  }
}
