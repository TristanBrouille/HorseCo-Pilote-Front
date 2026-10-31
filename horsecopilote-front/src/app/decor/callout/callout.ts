import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type CalloutTone = 'info' | 'warning' | 'late' | 'subtle';

@Component({
  selector: 'hc-callout',
  templateUrl: './callout.html',
  styleUrl: './callout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': "'tone-' + tone()" },
})
export class Callout {
  readonly tone = input<CalloutTone>('info');
}
