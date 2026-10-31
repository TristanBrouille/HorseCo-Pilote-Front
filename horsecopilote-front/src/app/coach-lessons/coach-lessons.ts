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
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { Badge } from '../decor/badge/badge';
import { Button } from '../decor/button/button';
import { CalendarEntry, calendarHours, dayColumns } from '../decor/calendar-layout/calendar-layout';
import { Callout } from '../decor/callout/callout';
import { BadgeCell } from '../decor/grid/badge-cell';
import { hcGridTheme } from '../decor/grid/hc-grid-theme';
import {
  DAY_LABELS,
  LESSON_STATUS_LABELS,
  LESSON_TYPE_LABELS,
  LOCATION_LABELS,
  dayMonthYearLabel,
  levelLabel,
  longDateLabel,
  shortDateLabel,
  timeRange,
} from '../decor/labels';
import { LessonBlock, LessonBlockData, LessonBlockState } from '../decor/lesson-block/lesson-block';
import { Modal } from '../decor/modal/modal';
import { PageHeader } from '../decor/page-header/page-header';
import { DayOfWeek } from '../weekly-slots/weeklySlotModel';
import { CoachLesson, LessonParticipant } from './coachLessonModel';
import { CoachLessonsService } from './coach-lessons-service';
import { addDays, dayOfWeekOf, mondayOf, parseIsoDate, timeOf, toIsoDate } from './week/week';

interface LessonEntry extends CalendarEntry {
  lesson: CoachLesson;
  block: LessonBlockData;
  state: LessonBlockState;
}

const ALL_DAYS = Object.keys(DAY_LABELS) as DayOfWeek[];
const WORKING_DAYS = ALL_DAYS.filter((day) => day !== 'SUNDAY');

const LOAD_ERRORS: Record<number, string> = {
  401: 'Votre session a expiré. Reconnectez-vous.',
  403: 'Cet agenda est réservé aux coachs.',
};

const participantsLabel = (count: number) =>
  count === 0 ? 'Aucun participant' : `${count} participant${count > 1 ? 's' : ''}`;

const coachName = (lesson: CoachLesson) => `${lesson.coach.firstName} ${lesson.coach.lastName}`;

const stateOf = (lesson: CoachLesson): LessonBlockState => {
  if (lesson.status === 'ANNULEE') {
    return 'cancelled';
  }
  if (!lesson.mine) {
    return 'other';
  }
  return lesson.hasPendingMembers ? 'late' : 'normal';
};

@Component({
  selector: 'app-coach-lessons',
  imports: [AgGridAngular, Badge, Button, Callout, LessonBlock, Modal, PageHeader],
  templateUrl: './coach-lessons.html',
  styleUrl: './coach-lessons.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoachLessons implements OnInit {
  private readonly coachLessonsService = inject(CoachLessonsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private loadRequest = 0;

  protected readonly theme = hcGridTheme;
  protected readonly dayLabels = DAY_LABELS;
  protected readonly typeLabels = LESSON_TYPE_LABELS;
  protected readonly locationLabels = LOCATION_LABELS;
  protected readonly statusLabels = LESSON_STATUS_LABELS;
  protected readonly timeRange = timeRange;
  protected readonly coachName = coachName;
  protected readonly participantsLabel = participantsLabel;
  protected readonly timeLabel = (hour: number) => `${String(hour).padStart(2, '0')}:00`;
  protected readonly participantsLocaleText = {
    noRowsToShow: 'Aucun participant validé pour cette leçon.',
  };

  protected readonly participantColumns: ColDef<LessonParticipant>[] = [
    {
      headerName: 'Cavalier',
      valueGetter: (p) => (p.data ? `${p.data.firstName} ${p.data.lastName}` : ''),
      cellClass: 'hc-cell-strong',
      flex: 1.4,
    },
    {
      headerName: 'Niveau',
      field: 'galopLevel',
      valueFormatter: (p) => levelLabel(p.value),
      cellRenderer: BadgeCell,
      cellRendererParams: { tone: 'brand' },
      flex: 1,
    },
    {
      headerName: 'Cheval',
      valueGetter: (p) => p.data?.horse?.name ?? 'Non attribué',
      cellClassRules: { 'hc-cell-muted': (p) => !p.data?.horse },
      flex: 1.2,
    },
  ];

  protected readonly weekStart = signal(mondayOf(new Date()));
  protected readonly lessons = signal<CoachLesson[]>([]);
  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly selectedLesson = signal<CoachLesson | null>(null);
  protected detailsOpen = signal(false);

  protected readonly weekLabel = computed(() => dayMonthYearLabel(this.weekStart()));
  protected readonly isCurrentWeek = computed(
    () => toIsoDate(this.weekStart()) === toIsoDate(mondayOf(new Date())),
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
        details: lesson.mine ? participantsLabel(lesson.participantCount) : coachName(lesson),
      },
    })),
  );

  // Monday to Saturday; Sunday only when the week has a lesson that day, so nothing is hidden.
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
  protected readonly pendingCount = computed(
    () => this.lessons().filter((lesson) => lesson.hasPendingMembers).length,
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

  protected openDetails(lesson: CoachLesson) {
    this.selectedLesson.set(lesson);
    this.detailsOpen.set(true);
  }

  protected lessonDate(lesson: CoachLesson): string {
    return longDateLabel(parseIsoDate(lesson.startDatetime)!);
  }

  protected blockAriaLabel(entry: LessonEntry): string {
    const owner = entry.lesson.mine ? 'votre leçon' : `leçon de ${coachName(entry.lesson)}`;
    const status = entry.state === 'cancelled' ? ', annulée' : '';
    const pending = entry.state === 'late' ? ', nouveaux inscrits à valider' : '';
    return (
      `${entry.block.topic}, ${owner}, ${this.dayLabels[entry.dayOfWeek].toLowerCase()} ` +
      `${entry.block.time}, ${entry.block.location}${status}${pending}. Voir le détail`
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
      const lessons = await this.coachLessonsService.getWeek(toIsoDate(this.weekStart()));
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
            'Impossible de charger les leçons. Vérifiez que le serveur est démarré.',
        );
      }
    } finally {
      if (request === this.loadRequest) {
        this.loading.set(false);
      }
    }
  }
}
