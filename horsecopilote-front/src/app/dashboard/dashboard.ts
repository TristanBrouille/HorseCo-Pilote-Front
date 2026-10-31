import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Role } from '../auth/authModel';
import { AuthService } from '../auth/authService';
import { Badge } from '../decor/badge/badge';
import { Button } from '../decor/button/button';
import { changeRequestLessonLabel } from '../decor/labels';
import { LessonChangeRequest } from '../my-reservations/myReservationModel';
import { DashboardService } from './dashboard-service';
import { NAVIGATION_BY_ROLE } from '../decor/navigation';
import { PageHeader } from '../decor/page-header/page-header';

const SUBTITLE_BY_ROLE: Record<Role, string> = {
  MEMBRE: 'Retrouvez vos cours et les créneaux du centre.',
  COACH: 'Préparez vos leçons de la semaine et vos cavaliers.',
  ADMIN: 'Gérez les membres, les chevaux et le planning du centre.',
};

const DECISION_ERRORS: Record<number, string> = {
  404: "Cette demande n'existe plus.",
  409: 'La demande ne peut plus être traitée : cours complet, niveau insuffisant ou déjà décidée.',
};

@Component({
  imports: [RouterLink, PageHeader, Badge, Button],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private readonly user = inject(AuthService).currentUser;
  private readonly dashboardService = inject(DashboardService);

  protected readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');
  protected readonly changeRequests = signal<LessonChangeRequest[]>([]);
  protected readonly deciding = signal<number | null>(null);
  protected readonly decisionError = signal<string | null>(null);
  protected readonly lessonLabel = changeRequestLessonLabel;

  protected readonly title = computed(() => `Bonjour ${this.user()?.firstname ?? ''}`.trim());
  protected readonly subtitle = computed(() => {
    const user = this.user();
    return user ? SUBTITLE_BY_ROLE[user.role] : '';
  });
  protected readonly features = computed(() => {
    const user = this.user();
    return user ? NAVIGATION_BY_ROLE[user.role].features : [];
  });

  async ngOnInit(): Promise<void> {
    if (this.isAdmin()) {
      await this.loadChangeRequests();
    }
  }

  protected async decide(request: LessonChangeRequest, accept: boolean): Promise<void> {
    this.deciding.set(request.id);
    this.decisionError.set(null);
    try {
      await (accept
        ? this.dashboardService.acceptChangeRequest(request.id)
        : this.dashboardService.refuseChangeRequest(request.id));
    } catch (error) {
      const status = (error as HttpErrorResponse).status;
      this.decisionError.set(DECISION_ERRORS[status] ?? "L'opération a échoué. Réessayez.");
    } finally {
      this.deciding.set(null);
    }
    await this.loadChangeRequests();
  }

  private async loadChangeRequests(): Promise<void> {
    try {
      this.changeRequests.set(await this.dashboardService.getPendingChangeRequests());
    } catch {
      this.decisionError.set('Impossible de charger les demandes de modification.');
    }
  }
}
