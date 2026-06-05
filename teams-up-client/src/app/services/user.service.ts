import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Team, UserRole } from '../models';

export interface UpdateUserDto {
  name?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  updateUser(id: number, dto: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, dto);
  }

  getUserTeams(id: number): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.apiUrl}/users/${id}/teams`);
  }

  // Admin endpoints
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/admin/users`);
  }

  updateUserRole(id: number, role: UserRole): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/admin/users/${id}/role?role=${role}`, {});
  }

  searchUsers(query: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users?q=${encodeURIComponent(query)}`);
  }
}
