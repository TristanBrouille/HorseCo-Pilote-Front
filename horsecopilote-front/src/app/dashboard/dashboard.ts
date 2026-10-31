import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Role } from '../auth/authModel';
import { AuthService } from '../auth/authService';
import { Badge } from '../decor/badge/badge';
import { NAVIGATION_BY_ROLE } from '../decor/navigation';
import { PageHeader } from '../decor/page-header/page-header';

const SUBTITLE_BY_ROLE: Record<Role, string> = {
  MEMBRE: 'Retrouvez vos cours et les créneaux du centre.',
  COACH: 'Préparez vos leçons de la semaine et vos cavaliers.',
  ADMIN: 'Gérez les membres, les chevaux et le planning du centre.',
};

@Component({
  imports: [RouterLink, PageHeader, Badge],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly user = inject(AuthService).currentUser;

  protected readonly title = computed(() => `Bonjour ${this.user()?.firstname ?? ''}`.trim());
  protected readonly subtitle = computed(() => {
    const user = this.user();
    return user ? SUBTITLE_BY_ROLE[user.role] : '';
  });
  protected readonly features = computed(() => {
    const user = this.user();
    return user ? NAVIGATION_BY_ROLE[user.role].features : [];
  });
}
