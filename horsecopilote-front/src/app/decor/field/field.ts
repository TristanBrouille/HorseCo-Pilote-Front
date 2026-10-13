import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'hc-field',
  template: `
    <label class="field" [class.has-error]="error()">
      <span class="hc-label">{{ label() }}</span>
      <ng-content />
      @if (error()) {
        <span class="message error" role="alert">{{ error() }}</span>
      } @else if (hint()) {
        <span class="message">{{ hint() }}</span>
      }
    </label>
  `,
  styleUrl: './field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Field {
  readonly label = input.required<string>();
  readonly error = input<string | null>(null);
  readonly hint = input<string | null>(null);
}
