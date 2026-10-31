import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { Field } from '../decor/field/field';
import {
  CHANGE_REQUEST_STATUS_LABELS,
  DAY_LABELS,
  LESSON_STATUS_LABELS,
  locationLabel,
  topicLabel,
  changeRequestLessonLabel,
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
import { LessonChangeRequest, MemberLesson } from './myReservationModel';

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

const CHANGE_ERRORS: Record<number, string> = {
  401: 'Votre session a expiré. Reconnectez-vous.',
  409: 'Demande impossible : le cours choisi est complet, hors de votre niveau ou déjà passé.',
};

// only upcoming lessons can be the source or the target of a change request
const isUpcoming = (lesson: MemberLesson) =>
  lesson.status === 'PREVUE' && new Date(lesson.startDatetime) > new Date();

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
  imports: [ReactiveFormsModule, Badge, Button, Callout, Field, LessonBlock, Modal, PageHeader],
  templateUrl: './my-reservations.html',
  styleUrl: './my-reservations.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyReservations implements OnInit {
  private readonly reservationsService = inject(MyReservationsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);
  private loadRequest = 0;

  protected readonly dayLabels = DAY_LABELS;
  protected readonly topicLabel = topicLabel;
  protected readonly locationLabel = locationLabel;
  protected readonly statusLabels = LESSON_STATUS_LABELS;
  protected readonly requestStatusLabels = CHANGE_REQUEST_STATUS_LABELS;
  protected readonly requestLessonLabel = changeRequestLessonLabel;
  protected readonly isUpcoming = isUpcoming;
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
  protected changeOpen = signal(false);
  protected readonly changeRequests = signal<LessonChangeRequest[]>([]);
  protected readonly changeError = signal<string | null>(null);
  protected readonly saving = signal(false);

  protected readonly changeForm = this.fb.group({
    toLessonId: this.fb.control<number | null>(null, Validators.required),
    reason: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(500)]],
  });

  // other upcoming lessons of the displayed week; capacity and level are checked by the back
  protected readonly changeTargets = computed(() =>
    this.lessons().filter((lesson) => !lesson.mine && isUpcoming(lesson)),
  );

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
        topic: topicLabel(lesson.topic),
        location: locationLabel(lesson.location),
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
    await Promise.all([this.loadWeek(), this.loadChangeRequests()]);
  }

  protected openChange() {
    this.changeForm.reset();
    this.changeError.set(null);
    this.detailsOpen.set(false);
    this.changeOpen.set(true);
  }

  protected async submitChange(): Promise<void> {
    if (this.changeForm.invalid) {
      this.changeForm.markAllAsTouched();
      return;
    }
    const { toLessonId, reason } = this.changeForm.getRawValue();
    this.saving.set(true);
    this.changeError.set(null);
    try {
      await this.reservationsService.createChangeRequest({
        fromLessonId: this.selectedLesson()!.id,
        toLessonId: toLessonId!,
        reason: reason.trim(),
      });
      this.changeOpen.set(false);
      await this.loadChangeRequests();
    } catch (error) {
      const status = (error as HttpErrorResponse).status;
      this.changeError.set(CHANGE_ERRORS[status] ?? 'La demande a échoué. Réessayez.');
    } finally {
      this.saving.set(false);
    }
  }

  protected changeFieldError(name: 'toLessonId' | 'reason'): string | null {
    const control = this.changeForm.controls[name];
    if (!control.touched || control.valid) {
      return null;
    }
    return control.hasError('maxlength') ? '500 caractères au maximum.' : 'Champ obligatoire.';
  }

  protected targetLabel(lesson: MemberLesson): string {
    return (
      `${shortDateLabel(parseIsoDate(lesson.startDatetime)!)} ` +
      `${timeRange(timeOf(lesson.startDatetime), timeOf(lesson.endDatetime))} · ` +
      `${topicLabel(lesson.topic)} · ${coachName(lesson)}`
    );
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

  private async loadChangeRequests(): Promise<void> {
    try {
      this.changeRequests.set(await this.reservationsService.getChangeRequests());
    } catch {
      // the calendar banner already reports a server or session problem
      this.changeRequests.set([]);
    }
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
