import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User, UserRole, LoginResponse } from '../models';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  
  private authState = signal<AuthState>({
    user: null,
    token: localStorage.getItem('access_token'),
    isAuthenticated: false,
  });

  user = computed(() => this.authState().user);
  isAuthenticated = computed(() => this.authState().isAuthenticated);
  role = computed(() => this.authState().user?.role ?? null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadToken();
  }

  private loadToken() {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.authState.set({
          user,
          token,
          isAuthenticated: true,
        });
      } catch {
        this.logout();
      }
    }
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password });
  }

  register(name: string, email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/register`, { name, email, password });
  }

  setAuth(response: LoginResponse) {
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('user_data', JSON.stringify(response.user));
    
    this.authState.set({
      user: response.user,
      token: response.access_token,
      isAuthenticated: true,
    });
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    
    this.authState.set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    
    this.router.navigate(['/login']);
  }

  hasRole(...roles: UserRole[]): boolean {
    const userRole = this.role();
    return userRole ? roles.includes(userRole) : false;
  }

  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  isProjectManager(): boolean {
    return this.hasRole(UserRole.PROJECT_MANAGER);
  }
}
