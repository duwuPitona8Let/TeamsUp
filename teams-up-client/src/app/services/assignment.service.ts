import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Assignment } from '../models';

export interface CreateAssignmentDto {
  userId?: number | null;
  teamId: number;
  role: string;
  isVacant?: boolean;
}

export interface UpdateAssignmentDto {
  role?: string;
  userId?: number;
  isVacant?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  createAssignment(dto: CreateAssignmentDto): Observable<Assignment> {
    return this.http.post<Assignment>(`${this.apiUrl}/assignments`, dto);
  }

  updateAssignment(id: number, dto: UpdateAssignmentDto): Observable<Assignment> {
    return this.http.put<Assignment>(`${this.apiUrl}/assignments/${id}`, dto);
  }

  assignToVacant(id: number, userId: number, role?: string): Observable<Assignment> {
    return this.http.post<Assignment>(`${this.apiUrl}/assignments/${id}/assign`, { userId, role });
  }

  deleteAssignment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/assignments/${id}`);
  }

  getAssignment(id: number): Observable<Assignment> {
    return this.http.get<Assignment>(`${this.apiUrl}/assignments/${id}`);
  }

  getTeamAssignments(teamId: number): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.apiUrl}/assignments/teams/${teamId}`);
  }

  getUserAssignments(userId: number): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.apiUrl}/assignments/users/${userId}`);
  }

  // Manager endpoints
  createManagerAssignment(dto: CreateAssignmentDto): Observable<Assignment> {
    return this.http.post<Assignment>(`${this.apiUrl}/manager/assignments`, dto);
  }
}
