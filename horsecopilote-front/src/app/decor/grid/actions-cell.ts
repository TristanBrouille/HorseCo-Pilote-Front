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
  templateUrl: './actions-cell.html',
  styleUrl: './actions-cell.scss',
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
