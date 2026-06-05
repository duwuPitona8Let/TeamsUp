import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { User, UserRole } from '../../../models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
})
export class UsersList implements OnInit {
  users = signal<User[]>([]);
  loading = signal(true);
  UserRole = UserRole;

  constructor(
    private userService: UserService,
    public authService: AuthService,
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.userService.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  changeRole(user: User, newRole: UserRole) {
    if (confirm(`Изменить роль пользователя ${user.name} на ${newRole}?`)) {
      this.userService.updateUserRole(user.id, newRole).subscribe({
        next: () => this.loadUsers(),
      });
    }
  }
}
