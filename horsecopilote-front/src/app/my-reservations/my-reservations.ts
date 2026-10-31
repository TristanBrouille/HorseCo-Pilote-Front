import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import {
  addDays,
  dayOfWeekOf,
  mondayOf,
  parseIsoDate,
  timeOf,
  toIsoDate,
} from '../coach-lessons/week/week';
import { Badge } from '../decor/badge/badge';
import { Button } from '../decor/button/button';
import { CalendarEntry, calendarHours, dayColumns } from '../decor/calendar-layout/calendar-layout';
import { Callout } from '../decor/callout/callout';
import {
  DAY_LABELS,
  LESSON_STATUS_LABELS,
  LESSON_TYPE_LABELS,
  LOCATION_LABELS,
  dayMonthYearLabel,
  longDateLabel,
  shortDateLabel,
  timeRange,
} from '../decor/labels';
import { LessonBlock, LessonBlockData, LessonBlockState } from '../decor/lesson-block/lesson-block';
import { Modal } from '../decor/modal/modal';
import { PageHeader } from '../decor/page-header/page-header';
import { DayOfWeek } from '../weekly-slots/weeklySlotModel';
import { MyReservationsService } from './my-reservations-service';
import { MemberLesson } from './myReservationModel';

interface LessonEntry extends CalendarEntry {
  lesson: MemberLesson;
  block: LessonBlockData;
  state: LessonBlockState;
}

const ALL_DAYS = Object.keys(DAY_LABELS) as DayOfWeek[];
const WORKING_DAYS = ALL_DAYS.filter((day) => day !== 'SUNDAY');

const LOAD_ERRORS: Record<number, string> = {
  401: 'Votre session a expiré. Reconnectez-vous.',
  403: 'Cette page est réservée aux membres.',
};

const coachName = (lesson: MemberLesson) => `${lesson.coach.firstName} ${lesson.coach.lastName}`;

const horseLabel = (lesson: MemberLesson) => lesson.horse?.name ?? 'Cheval non attribué';

// the member's own lessons are highlighted, the others stay in the background
const stateOf = (lesson: MemberLesson): LessonBlockState => {
  if (lesson.status === 'ANNULEE') {
    return 'cancelled';
  }
  return lesson.mine ? 'normal' : 'other';
};

@Component({
  selector: 'app-my-reservations',
  imports: [Badge, Button, Callout, LessonBlock, Modal, PageHeader],
  templateUrl: './my-reservations.html',
  styleUrl: './my-reservations.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyReservations implements OnInit {
  private readonly reservationsService = inject(MyReservationsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private loadRequest = 0;

  protected readonly dayLabels = DAY_LABELS;
  protected readonly typeLabels = LESSON_TYPE_LABELS;
  protected readonly locationLabels = LOCATION_LABELS;
  protected readonly statusLabels = LESSON_STATUS_LABELS;
  protected readonly timeRange = timeRange;
  protected readonly timeOf = timeOf;
  protected readonly coachName = coachName;
  protected readonly horseLabel = horseLabel;
  protected readonly timeLabel = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

  protected readonly weekStart = signal(mondayOf(new Date()));
  protected readonly lessons = signal<MemberLesson[]>([]);
  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly selectedLesson = signal<MemberLesson | null>(null);
  protected detailsOpen = signal(false);

  protected readonly weekLabel = computed(() => dayMonthYearLabel(this.weekStart()));
  protected readonly isCurrentWeek = computed(
    () => toIsoDate(this.weekStart()) === toIsoDate(mondayOf(new Date())),
  );
  protected readonly myLessonCount = computed(
    () => this.lessons().filter((lesson) => lesson.mine).length,
  );

  protected readonly entries = computed<LessonEntry[]>(() =>
    this.lessons().map((lesson) => ({
      id: lesson.id,
      dayOfWeek: dayOfWeekOf(parseIsoDate(lesson.startDatetime)!),
      startTime: timeOf(lesson.startDatetime),
      endTime: timeOf(lesson.endDatetime),
      lesson,
      state: stateOf(lesson),
      block: {
        time: timeRange(timeOf(lesson.startDatetime), timeOf(lesson.endDatetime)),
        topic: LESSON_TYPE_LABELS[lesson.topic],
        location: LOCATION_LABELS[lesson.location],
        details: lesson.mine ? horseLabel(lesson) : coachName(lesson),
      },
    })),
  );

  protected readonly days = computed(() =>
    this.entries().some((entry) => entry.dayOfWeek === 'SUNDAY') ? ALL_DAYS : WORKING_DAYS,
  );
  protected readonly dayDates = computed(
    () =>
      Object.fromEntries(
        ALL_DAYS.map((day, index) => [day, shortDateLabel(addDays(this.weekStart(), index))]),
      ) as Record<DayOfWeek, string>,
  );
  protected readonly hours = computed(() => calendarHours(this.entries()));
  protected readonly columns = computed(() =>
    dayColumns(this.entries(), this.days(), this.hours()[0]),
  );

  async ngOnInit(): Promise<void> {
    const requested = parseIsoDate(this.route.snapshot.queryParamMap.get('semaine') ?? '');
    if (requested) {
      this.weekStart.set(mondayOf(requested));
    }
    await this.loadWeek();
  }

  protected async previousWeek(): Promise<void> {
    await this.goToWeek(addDays(this.weekStart(), -7));
  }

  protected async nextWeek(): Promise<void> {
    await this.goToWeek(addDays(this.weekStart(), 7));
  }

  protected async currentWeek(): Promise<void> {
    await this.goToWeek(mondayOf(new Date()));
  }

  protected openDetails(lesson: MemberLesson) {
    this.selectedLesson.set(lesson);
    this.detailsOpen.set(true);
  }

  protected lessonDate(lesson: MemberLesson): string {
    return longDateLabel(parseIsoDate(lesson.startDatetime)!);
  }

  protected blockAriaLabel(entry: LessonEntry): string {
    const owner = entry.lesson.mine ? 'votre cours' : `cours de ${coachName(entry.lesson)}`;
    const status = entry.state === 'cancelled' ? ', annulé' : '';
    return (
      `${entry.block.topic}, ${owner}, ${this.dayLabels[entry.dayOfWeek].toLowerCase()} ` +
      `${entry.block.time}, ${entry.block.location}${status}. Voir le détail`
    );
  }

  private async goToWeek(monday: Date): Promise<void> {
    this.weekStart.set(monday);
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { semaine: toIsoDate(monday) },
      replaceUrl: true,
    });
    await this.loadWeek();
  }

  private async loadWeek(): Promise<void> {
    // a slow answer for a previous week must not overwrite the current one
    const request = ++this.loadRequest;
    this.loading.set(true);
    try {
      const lessons = await this.reservationsService.getWeek(toIsoDate(this.weekStart()));
      if (request === this.loadRequest) {
        this.lessons.set(lessons);
        this.loadError.set(null);
      }
    } catch (error) {
      if (request === this.loadRequest) {
        this.lessons.set([]);
        const status = (error as HttpErrorResponse).status;
        this.loadError.set(
          LOAD_ERRORS[status] ??
            'Impossible de charger les cours. Vérifiez que le serveur est démarré.',
        );
      }
    } finally {
      if (request === this.loadRequest) {
        this.loading.set(false);
      }
    }
  }
}
