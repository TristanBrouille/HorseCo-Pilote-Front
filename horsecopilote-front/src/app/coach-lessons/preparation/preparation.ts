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
import { Badge } from '../../decor/badge/badge';
import { Callout } from '../../decor/callout/callout';
import {
  LESSON_STATUS_LABELS,
  LESSON_TYPE_LABELS,
  LOCATION_LABELS,
  longDateLabel,
  timeRange,
} from '../../decor/labels';
import { PageHeader } from '../../decor/page-header/page-header';
import { CoachLesson } from '../coachLessonModel';
import { CoachLessonsService } from '../coach-lessons-service';
import { LessonEditor } from '../lesson-editor/lesson-editor';
import { mondayOf, parseIsoDate, timeOf, toIsoDate } from '../week/week';
import { WeekNav } from '../week-nav/week-nav';

const LOAD_ERRORS: Record<number, string> = {
  401: 'Votre session a expiré. Reconnectez-vous.',
  403: 'Cette page est réservée aux coachs.',
};

// The connected coach's lessons of a week, one card each, to set their topic and horses.
@Component({
  selector: 'app-preparation',
  imports: [Badge, Callout, LessonEditor, PageHeader, WeekNav],
  templateUrl: './preparation.html',
  styleUrl: './preparation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Preparation implements OnInit {
  private readonly coachLessonsService = inject(CoachLessonsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private loadRequest = 0;

  protected readonly typeLabels = LESSON_TYPE_LABELS;
  protected readonly locationLabels = LOCATION_LABELS;
  protected readonly statusLabels = LESSON_STATUS_LABELS;

  protected readonly weekStart = signal(mondayOf(new Date()));
  protected readonly lessons = signal<CoachLesson[]>([]);
  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);

  // The API returns every lesson of the centre and flags the coach's own ones (mine).
  protected readonly ownLessons = computed(() => this.lessons().filter((lesson) => lesson.mine));
  protected readonly ridersWithoutHorse = computed(
    () =>
      this.ownLessons()
        .filter((lesson) => lesson.status === 'PREVUE')
        .flatMap((lesson) => lesson.participants ?? [])
        .filter((participant) => !participant.horse).length,
  );

  async ngOnInit(): Promise<void> {
    const requested = parseIsoDate(this.route.snapshot.queryParamMap.get('semaine') ?? '');
    if (requested) {
      this.weekStart.set(mondayOf(requested));
    }
    await this.loadWeek();
  }

  protected async goToWeek(monday: Date): Promise<void> {
    this.weekStart.set(monday);
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { semaine: toIsoDate(monday) },
      replaceUrl: true,
    });
    await this.loadWeek();
  }

  protected onLessonChanged(updated: CoachLesson) {
    this.lessons.update((lessons) =>
      lessons.map((lesson) => (lesson.id === updated.id ? updated : lesson)),
    );
  }

  protected lessonDate(lesson: CoachLesson): string {
    return longDateLabel(parseIsoDate(lesson.startDatetime)!);
  }

  protected lessonTime(lesson: CoachLesson): string {
    return timeRange(timeOf(lesson.startDatetime), timeOf(lesson.endDatetime));
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
            'Impossible de charger vos leçons. Vérifiez que le serveur est démarré.',
        );
      }
    } finally {
      if (request === this.loadRequest) {
        this.loading.set(false);
      }
    }
  }
}
