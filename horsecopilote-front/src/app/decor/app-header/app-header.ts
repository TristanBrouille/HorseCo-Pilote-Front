import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Me } from '../../auth/authModel';
import { Badge } from '../badge/badge';
import { Button } from '../button/button';
import { ROLE_LABELS, longDateLabel } from '../labels';

@Component({
  selector: 'hc-app-header',
  imports: [Badge, Button],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeader {
  readonly user = input.required<Me>();
  readonly loggingOut = input(false);
  readonly logout = output<void>();

  protected readonly today = longDateLabel(new Date());
  protected readonly role = computed(() => ROLE_LABELS[this.user().role]);
  protected readonly fullName = computed(() => `${this.user().firstname} ${this.user().lastname}`);
  protected readonly initials = computed(() =>
    `${this.user().firstname.charAt(0)}${this.user().lastname.charAt(0)}`.toUpperCase(),
  );
}
