import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email = signal('');
  password = signal('');
  error = signal('');
  loading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit() {
    this.error.set('');
    this.loading.set(true);

    this.authService.login(this.email(), this.password()).subscribe({
      next: (response) => {
        this.authService.setAuth(response);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Ошибка входа');
      },
    });
  }
}
