import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { UserRole } from './models';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login').then((m) => m.Login) },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register').then((m) => m.Register),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard],
  },
  {
    path: 'teams',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/teams/teams-list/teams-list').then((m) => m.TeamsList),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./components/teams/team-form/team-form').then((m) => m.TeamForm),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/teams/team-detail/team-detail').then((m) => m.TeamDetail),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./components/teams/team-form/team-form').then((m) => m.TeamForm),
      },
      {
        path: ':id/roster',
        loadComponent: () =>
          import('./components/teams/team-roster/team-roster').then((m) => m.TeamRoster),
      },
      {
        path: ':id/stats',
        loadComponent: () =>
          import('./components/teams/team-stats/team-stats').then((m) => m.TeamStatsComponent),
      },
    ],
  },
  {
    path: 'vacancies',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/vacancies/vacancies-list/vacancies-list').then((m) => m.VacanciesList),
      },
      {
        path: ':id/apply',
        loadComponent: () =>
          import('./components/vacancies/application-form/application-form').then((m) => m.ApplicationForm),
      },
    ],
  },
  {
    path: 'recruiter',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER] },
    loadComponent: () =>
      import('./components/recruiter/recruiter-panel/recruiter-panel').then((m) => m.RecruiterPanel),
  },
  {
    path: 'users',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/users/users-list/users-list').then((m) => m.UsersList),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/users/user-detail/user-detail').then((m) => m.UserDetail),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN] },
    loadComponent: () => import('./components/dashboard/dashboard').then((m) => m.Dashboard),
  },
  { path: '**', redirectTo: 'dashboard' },
];
