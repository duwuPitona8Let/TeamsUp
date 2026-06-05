import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TeamService } from '../../../services/team.service';
import { TeamStats } from '../../../models';

@Component({
  selector: 'app-team-stats',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './team-stats.html',
  styleUrl: './team-stats.scss',
})
export class TeamStatsComponent implements OnInit {
  stats = signal<TeamStats | null>(null);
  loading = signal(true);

  maxRoleCount = computed(() => {
    const roles = this.stats()?.roles ?? [];
    return Math.max(...roles.map((r) => r.total), 1);
  });

  constructor(
    private route: ActivatedRoute,
    private teamService: TeamService,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.teamService.getTeamStats(id).subscribe({
      next: (s) => {
        this.stats.set(s);
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

  roleColor(role: string): string {
    const map: Record<string, string> = {
      developer: '#667eea',
      designer: '#f093fb',
      tester: '#4facfe',
      analyst: '#43e97b',
    };
    return map[role] ?? '#aaa';
  }

  funnelWidth(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }
}
