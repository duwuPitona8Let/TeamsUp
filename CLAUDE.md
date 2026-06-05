# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

Monorepo with two separate projects:
- `teams-up/` — NestJS backend (REST API, port 3000)
- `teams-up-client/` — Angular 21 frontend (port 4200)

## Commands

### Backend (`teams-up/`)
```bash
npm run start:dev   # dev server with hot reload
npm run build       # compile to dist/
npm run lint        # ESLint with auto-fix
npm test            # Jest unit tests
npm run test:e2e    # e2e tests
```

### Frontend (`teams-up-client/`)
```bash
npm start           # ng serve (dev server)
npm run build       # production build
npm test            # Vitest tests
```

## Backend Architecture

**Stack:** NestJS + TypeORM + SQLite + Passport JWT

**Database** is a local SQLite file (`teams-up.sqlite`), auto-synced via `synchronize: true` — schema changes to entities apply immediately on restart.

**Auth flow:** `POST /auth/register` and `POST /auth/login` return a JWT. All protected routes use `@UseGuards(AuthGuard('jwt'), RolesGuard)`. Role restrictions use `@Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)` decorator. JWT secret defaults to `teams-up-secret-key-change-in-production` (override with `JWT_SECRET` env var).

**Roles:** `user` | `admin` | `project_manager` — stored on the `User` entity.

**Key domain concepts:**
- `Team` — a project team with status `active | closed`
- `Assignment` — a position in a team; `isVacant: true` means an open slot without a user
- `Application` — a candidate's response to a vacant Assignment; status `pending | accepted | rejected`. Accepting an application fills the vacancy and auto-rejects other pending applications for the same slot.

**Module layout:** each domain has its own module folder (`auth/`, `teams/`, `assignments/`, `applications/`, `users/`, `admin/`, `project-manager/`). Shared DTOs live in `src/dto/`, entities in `src/entities/`.

**Public endpoints** (no JWT required): `GET /vacancies`, `POST /applications`.

**Config** via `src/config/configuration.ts` — reads `PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `DB_PATH` from environment.

## Frontend Architecture

**Stack:** Angular 21 standalone components, signals, functional guards/interceptors.

**Auth state** is managed in `AuthService` using Angular signals (`signal`, `computed`). Token and user data are persisted in `localStorage`. The `authInterceptor` automatically attaches `Authorization: Bearer <token>` to every HTTP request.

**Route protection:** `authGuard` checks authentication; `roleGuard` checks `route.data.roles` against the current user's role.

**API base URL** is hardcoded as `http://localhost:3000` in each service — change all occurrences if the backend port changes.

**Key pages and their routes:**
| Route | Purpose | Access |
|---|---|---|
| `/vacancies` | Open vacancy listings | Public |
| `/vacancies/:id/apply` | Candidate application form | Public |
| `/recruiter` | Recruiter panel (review/accept/reject) | Admin, PM |
| `/teams/:id/roster` | Team member composition view | Authenticated |
| `/teams/:id/stats` | Team statistics (completion, roles, funnel) | Authenticated |

**Models** are defined in `src/app/models/index.ts` — the single source of truth for frontend interfaces and enums.

**SVG attributes** in templates must use `[attr.stroke-dasharray]` syntax, not `{{ }}` interpolation — Angular does not support property binding on SVG presentation attributes directly.
