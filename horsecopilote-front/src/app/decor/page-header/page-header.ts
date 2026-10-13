import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'hc-page-header',
  template: `
    <div class="text">
      <h1 class="hc-display">{{ title() }}</h1>
      @if (subtitle()) {
        <p class="hc-body hc-muted">{{ subtitle() }}</p>
      }
    </div>
    <ng-content select="[actions]" />
  `,
  styles: `
    :host {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: var(--hc-space-3);
    }

    .text {
      display: flex;
      flex-direction: column;
      gap: var(--hc-space-1);
    }

    h1,
    p {
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
