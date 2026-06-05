import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team, Assignment, TeamStats } from '../models';

export interface CreateTeamDto {
  name: string;
  description?: string;
  status?: 'active' | 'closed';
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
  status?: 'active' | 'closed';
}

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getAllTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.apiUrl}/teams`);
  }

  getTeam(id: number): Observable<Team> {
    return this.http.get<Team>(`${this.apiUrl}/teams/${id}`);
  }

  createTeam(dto: CreateTeamDto): Observable<Team> {
    return this.http.post<Team>(`${this.apiUrl}/teams`, dto);
  }

  updateTeam(id: number, dto: UpdateTeamDto): Observable<Team> {
    return this.http.put<Team>(`${this.apiUrl}/teams/${id}`, dto);
  }

  deleteTeam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/teams/${id}`);
  }

  getTeamMembers(id: number): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.apiUrl}/teams/${id}/members`);
  }

  getTeamAssignments(id: number): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.apiUrl}/teams/${id}/assignments`);
  }

  getTeamStats(id: number): Observable<TeamStats> {
    return this.http.get<TeamStats>(`${this.apiUrl}/teams/${id}/stats`);
  }

  // Manager endpoints
  getManagerTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.apiUrl}/manager/teams`);
  }
}
