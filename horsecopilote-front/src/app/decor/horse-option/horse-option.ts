import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

// One horse in the assignment list: a radio row, greyed out with its reason when not selectable.
@Component({
  selector: 'hc-horse-option',
  templateUrl: './horse-option.html',
  styleUrl: './horse-option.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.aria-disabled]': '!selectable() || null',
  },
})
export class HorseOption {
  readonly group = input.required<string>();
  readonly name = input.required<string>();
  // 'Selle Français · 560 kg · Galop 3'
  readonly details = input('');
  // '1/3 h'
  readonly workload = input('');
  readonly selectable = input(true);
  readonly reason = input<string | null>(null);
  readonly selected = input(false);
  readonly select = output<void>();
}
