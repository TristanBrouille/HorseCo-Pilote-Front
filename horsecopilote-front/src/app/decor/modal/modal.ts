import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  model,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'hc-modal',
  template: `
    <dialog
      #dialog
      [style.width.px]="width()"
      [attr.aria-label]="title()"
      (close)="open.set(false)"
      (click)="closeOnScrim($event)"
    >
      <h2 class="hc-title-1">{{ title() }}</h2>
      <ng-content />
      <div class="actions">
        <ng-content select="[actions]" />
      </div>
    </dialog>
  `,
  styleUrl: './modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  readonly title = input.required<string>();
  readonly width = input(520);
  readonly open = model(false);

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    // The native <dialog> gives the scrim, the Escape key and the focus trap for free.
    effect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.open() && !dialog.open) {
        dialog.showModal();
      } else if (!this.open() && dialog.open) {
        dialog.close();
      }
    });
  }

  protected closeOnScrim(event: MouseEvent) {
    if (event.target === this.dialog().nativeElement) {
      this.open.set(false);
    }
  }
}
