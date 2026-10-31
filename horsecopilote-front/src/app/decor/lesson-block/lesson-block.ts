import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Badge, BadgeTone } from '../badge/badge';

// 'other': lesson given by another coach, shown in the background of the agenda
export type LessonBlockState = 'normal' | 'late' | 'cancelled' | 'to-create' | 'other';

export interface LessonBlockData {
  time: string;
  topic: string;
  location: string;
  details: string;
}

const STATE_BADGES: Partial<Record<LessonBlockState, { label: string; tone: BadgeTone }>> = {
  late: { label: 'Nouvel inscrit', tone: 'warning' },
  cancelled: { label: 'Annulée', tone: 'danger' },
};

@Component({
  selector: 'button[hc-lesson-block]',
  imports: [Badge],
  templateUrl: './lesson-block.html',
  styleUrl: './lesson-block.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    type: 'button',
    '[class]': "'state-' + state()",
    '(click)': 'open.emit()',
  },
})
export class LessonBlock {
  readonly lesson = input.required<LessonBlockData>();
  readonly state = input<LessonBlockState>('normal');
  readonly open = output<void>();

  protected readonly badge = computed(() => STATE_BADGES[this.state()] ?? null);
}
