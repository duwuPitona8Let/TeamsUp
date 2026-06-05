import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  name = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  error = signal('');
  loading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit() {
    this.error.set('');

    if (this.password() !== this.confirmPassword()) {
      this.error.set('Пароли не совпадают');
      return;
    }

    if (this.password().length < 6) {
      this.error.set('Пароль должен быть не менее 6 символов');
      return;
    }

    this.loading.set(true);

    this.authService.register(this.name(), this.email(), this.password()).subscribe({
      next: (response) => {
        this.authService.setAuth(response);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Ошибка регистрации');
      },
    });
  }
}
