import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Application, Vacancy } from '../models';

export interface CreateApplicationDto {
  assignmentId: number;
  candidateName: string;
  candidateEmail: string;
  coverLetter?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getVacancies(): Observable<Vacancy[]> {
    return this.http.get<Vacancy[]>(`${this.apiUrl}/vacancies`);
  }

  getRecommendedVacancies(): Observable<Vacancy[]> {
    return this.http.get<Vacancy[]>(`${this.apiUrl}/vacancies/recommended`);
  }

  submitApplication(dto: CreateApplicationDto): Observable<Application> {
    return this.http.post<Application>(`${this.apiUrl}/applications`, dto);
  }

  getAllApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrl}/applications`);
  }

  getVacancyApplications(assignmentId: number): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrl}/applications/vacancy/${assignmentId}`);
  }

  acceptApplication(id: number): Observable<Application> {
    return this.http.put<Application>(`${this.apiUrl}/applications/${id}/accept`, {});
  }

  rejectApplication(id: number): Observable<Application> {
    return this.http.put<Application>(`${this.apiUrl}/applications/${id}/reject`, {});
  }
}
