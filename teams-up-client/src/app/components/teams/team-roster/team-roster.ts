import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TeamService } from '../../../services/team.service';
import { AssignmentService } from '../../../services/assignment.service';
import { Team, Assignment, TeamStatus } from '../../../models';

@Component({
  selector: 'app-team-roster',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './team-roster.html',
  styleUrl: './team-roster.scss',
})
export class TeamRoster implements OnInit {
  team = signal<Team | null>(null);
  assignments = signal<Assignment[]>([]);
  loading = signal(true);
  TeamStatus = TeamStatus;

  filled = computed(() => this.assignments().filter((a) => !a.isVacant));
  vacancies = computed(() => this.assignments().filter((a) => a.isVacant));
  progress = computed(() => {
    const total = this.assignments().length;
    if (total === 0) return 0;
    return Math.round((this.filled().length / total) * 100);
  });

  constructor(
    private route: ActivatedRoute,
    private teamService: TeamService,
    private assignmentService: AssignmentService,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.teamService.getTeam(id).subscribe({ next: (t) => this.team.set(t) });
    this.assignmentService.getTeamAssignments(id).subscribe({
      next: (a) => {
        this.assignments.set(a);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  roleLabel(role: string): string {
    const map: Record<string, string> = {
      developer: 'Разработчик',
      designer: 'Дизайнер',
      tester: 'Тестировщик',
      analyst: 'Аналитик',
    };
    return map[role] ?? role;
  }

  initials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('');
  }
}
