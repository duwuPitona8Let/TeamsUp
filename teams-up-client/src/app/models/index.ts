export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  PROJECT_MANAGER = 'project_manager',
}

export enum TeamStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  registrationDate?: string;
  role: UserRole;
}

export interface Team {
  id: number;
  name: string;
  description: string;
  creationDate: string;
  status: TeamStatus;
}

export interface Assignment {
  id: number;
  userId: number | null;
  teamId: number;
  role: string;
  assignmentDate: string;
  isVacant?: boolean;
  user?: User;
  team?: Team;
}

export enum ApplicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export interface Application {
  id: number;
  assignmentId: number;
  candidateName: string;
  candidateEmail: string;
  coverLetter?: string;
  status: ApplicationStatus;
  createdAt: string;
  assignment?: Assignment & { team?: Team };
}

export interface Vacancy {
  id: number;
  teamId: number;
  role: string;
  assignmentDate: string;
  isVacant: boolean;
  team: Team;
}

export interface TeamStats {
  team: Team;
  positions: {
    total: number;
    filled: number;
    vacant: number;
    completionRate: number;
  };
  roles: { role: string; total: number; filled: number }[];
  applications: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
  };
}
