import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { Badge, BadgeTone } from '../badge/badge';

export type BadgeCellParams = ICellRendererParams & { tone?: BadgeTone };

@Component({
  selector: 'hc-badge-cell',
  imports: [Badge],
  templateUrl: './badge-cell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeCell implements ICellRendererAngularComp {
  protected readonly label = signal('');
  protected readonly tone = signal<BadgeTone>('neutral');

  agInit(params: BadgeCellParams): void {
    this.refresh(params);
  }

  refresh(params: BadgeCellParams): boolean {
    this.label.set(params.valueFormatted ?? String(params.value ?? ''));
    this.tone.set(params.tone ?? 'neutral');
    return true;
  }
}
