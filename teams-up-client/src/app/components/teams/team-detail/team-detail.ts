import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../../services/team.service';
import { AssignmentService } from '../../../services/assignment.service';
import { AuthService } from '../../../services/auth.service';
import { Team, Assignment, User } from '../../../models';
import { CommonModule } from '@angular/common';
import { UserSearch } from '../../shared/user-search/user-search';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, UserSearch],
  templateUrl: './team-detail.html',
  styleUrl: './team-detail.scss',
})
export class TeamDetail implements OnInit {
  team = signal<Team | null>(null);
  assignments = signal<Assignment[]>([]);
  loading = signal(true);
  showAssignForm = signal(false);
  newAssignmentUserId = signal<number | null>(null);
  newAssignmentRole = signal('developer');
  isVacantPosition = signal(false);
  editingVacancyId = signal<number | null>(null);

  constructor(
    private route: ActivatedRoute,
    private teamService: TeamService,
    private assignmentService: AssignmentService,
    public authService: AuthService,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTeam(id);
    this.loadAssignments(id);
  }

  loadTeam(id: number) {
    this.teamService.getTeam(id).subscribe({
      next: (team: Team) => this.team.set(team),
    });
  }

  loadAssignments(id: number) {
    this.assignmentService.getTeamAssignments(id).subscribe({
      next: (assignments: Assignment[]) => {
        this.assignments.set(assignments);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  deleteAssignment(id: number) {
    if (confirm('Удалить это назначение?')) {
      this.assignmentService.deleteAssignment(id).subscribe({
        next: () => {
          const teamId = this.team()?.id;
          if (teamId) this.loadAssignments(teamId);
        },
      });
    }
  }

  createAssignment() {
    const teamId = this.team()?.id;
    const userId = this.isVacantPosition() ? null : this.newAssignmentUserId();

    if (!teamId) return;
    if (!this.isVacantPosition() && !userId) return;

    this.assignmentService
      .createAssignment({
        userId,
        teamId,
        role: this.newAssignmentRole(),
        isVacant: this.isVacantPosition(),
      })
      .subscribe({
        next: () => {
          this.showAssignForm.set(false);
          this.isVacantPosition.set(false);
          this.newAssignmentUserId.set(null);
          this.loadAssignments(teamId);
        },
      });
  }

  startEditingVacancy(assignment: Assignment) {
    this.editingVacancyId.set(assignment.id);
    this.newAssignmentRole.set(assignment.role);
  }

  cancelEditingVacancy() {
    this.editingVacancyId.set(null);
  }

  assignUserToVacancy(assignmentId: number) {
    const userId = this.newAssignmentUserId();
    if (!userId) return;

    this.assignmentService
      .assignToVacant(assignmentId, userId, this.newAssignmentRole())
      .subscribe({
        next: () => {
          this.editingVacancyId.set(null);
          this.newAssignmentUserId.set(null);
          const teamId = this.team()?.id;
          if (teamId) this.loadAssignments(teamId);
        },
      });
  }
}
