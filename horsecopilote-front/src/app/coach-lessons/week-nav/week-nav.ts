import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Button } from '../../decor/button/button';
import { dayMonthYearLabel } from '../../decor/labels';
import { addDays, mondayOf, toIsoDate } from '../week/week';

// Previous / next / current week buttons; emits the Monday of the chosen week.
@Component({
  selector: 'app-week-nav',
  imports: [Button],
  templateUrl: './week-nav.html',
  styleUrl: './week-nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'group', 'aria-label': 'Changer de semaine' },
})
export class WeekNav {
  readonly weekStart = input.required<Date>();
  readonly weekChange = output<Date>();

  protected readonly weekLabel = computed(() => dayMonthYearLabel(this.weekStart()));
  protected readonly isCurrentWeek = computed(
    () => toIsoDate(this.weekStart()) === toIsoDate(mondayOf(new Date())),
  );

  protected previousWeek() {
    this.weekChange.emit(addDays(this.weekStart(), -7));
  }

  protected nextWeek() {
    this.weekChange.emit(addDays(this.weekStart(), 7));
  }

  protected currentWeek() {
    this.weekChange.emit(mondayOf(new Date()));
  }
}
