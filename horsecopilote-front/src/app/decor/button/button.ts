import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'button[hc-button]',
  template: '<ng-content />',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': "'hc-button-' + variant()",
    '[class.full-width]': 'fullWidth()',
  },
})
export class Button {
  readonly variant = input<'primary' | 'secondary' | 'ghost' | 'danger'>('primary');
  readonly fullWidth = input(false);
}
