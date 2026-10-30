import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'hc-field',
  templateUrl: './field.html',
  styleUrl: './field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Field {
  readonly label = input.required<string>();
  readonly error = input<string | null>(null);
  readonly hint = input<string | null>(null);
}
