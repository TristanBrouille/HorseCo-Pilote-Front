import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { Button } from '../button/button';

export interface RowAction<T> {
  label: string;
  run: (row: T) => void;
}

export type ActionsCellParams<T = unknown> = ICellRendererParams<T> & { actions: RowAction<T>[] };

@Component({
  selector: 'hc-actions-cell',
  imports: [Button],
  template: `
    @for (action of actions(); track action.label) {
      <button hc-button variant="ghost" type="button" (click)="action.run(row()!)">
        {{ action.label }}
      </button>
    }
  `,
  styles: `
    :host {
      display: flex;
      justify-content: flex-end;
      gap: var(--hc-space-1);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionsCell implements ICellRendererAngularComp {
  protected readonly actions = signal<RowAction<unknown>[]>([]);
  protected readonly row = signal<unknown>(null);

  agInit(params: ActionsCellParams): void {
    this.refresh(params);
  }

  refresh(params: ActionsCellParams): boolean {
    this.actions.set(params.actions);
    this.row.set(params.data);
    return true;
  }
}
