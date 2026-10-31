import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Role } from '../../auth/authModel';
import { NavItem } from '../nav-item/nav-item';
import { NAVIGATION_BY_ROLE } from '../navigation';

@Component({
  selector: 'hc-sidebar',
  imports: [NavItem],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  readonly role = input.required<Role>();

  protected readonly navigation = computed(() => NAVIGATION_BY_ROLE[this.role()]);
  // Seules les fonctionnalités déjà développées apparaissent dans le menu.
  protected readonly items = computed(() =>
    this.navigation().features.filter((feature) => feature.route !== null),
  );
}
