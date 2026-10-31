import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Badge } from '../../decor/badge/badge';
import { Button } from '../../decor/button/button';
import { Callout } from '../../decor/callout/callout';
import { Field } from '../../decor/field/field';
import { HorseOption as HorseOptionRow } from '../../decor/horse-option/horse-option';
import {
  LESSON_STATUS_LABELS,
  LESSON_TYPES,
  LESSON_TYPE_LABELS,
  horseUnavailabilityLabel,
  levelLabel,
  workloadLabel,
} from '../../decor/labels';
import { CoachLesson, HorseOption, LessonParticipant, LessonType } from '../coachLessonModel';
import { CoachLessonsService } from '../coach-lessons-service';

const COMMON_ERRORS: Record<number, string> = {
  401: 'Votre session a expiré. Reconnectez-vous.',
  403: 'Vous ne pouvez modifier que vos propres leçons.',
  404: "Cette leçon ou ce participant n'existe plus. Rechargez la page.",
};

const TOPIC_CONFLICT = "La leçon n'est plus prévue : son sujet ne peut plus être modifié.";
const HORSE_CONFLICT =
  'Ce cheval ne peut plus être attribué (la leçon ou les plannings ont changé). La liste a été mise à jour.';

const fullName = (participant: LessonParticipant) =>
  `${participant.firstName} ${participant.lastName}`;

// Lets the coach of a lesson change its topic and give a horse to each participant (R12, R20).
// Every rule is checked by the back: this component only shows the flags it returns.
@Component({
  selector: 'app-lesson-editor',
  imports: [Badge, Button, Callout, Field, HorseOptionRow],
  templateUrl: './lesson-editor.html',
  styleUrl: './lesson-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LessonEditor {
  private readonly coachLessonsService = inject(CoachLessonsService);

  readonly lesson = input.required<CoachLesson>();
  readonly changed = output<CoachLesson>();

  protected readonly lessonTypes = LESSON_TYPES;
  protected readonly typeLabels = LESSON_TYPE_LABELS;
  protected readonly levelLabel = levelLabel;
  protected readonly fullName = fullName;

  protected readonly editable = computed(() => this.lesson().status === 'PREVUE');
  protected readonly participants = computed(() => this.lesson().participants ?? []);
  protected readonly lockedReason = computed(
    () =>
      `Leçon ${LESSON_STATUS_LABELS[this.lesson().status].label.toLowerCase()} : ` +
      'elle ne peut plus être modifiée.',
  );

  // Reset whenever another lesson is shown.
  protected readonly topic = linkedSignal(() => this.lesson().topic);
  protected readonly pickingFor = linkedSignal<number, LessonParticipant | null>({
    source: () => this.lesson().id,
    computation: () => null,
  });
  protected readonly error = linkedSignal<number, string | null>({
    source: () => this.lesson().id,
    computation: () => null,
  });
  protected readonly notice = linkedSignal<number, string | null>({
    source: () => this.lesson().id,
    computation: () => null,
  });

  protected readonly savingTopic = signal(false);
  protected readonly options = signal<HorseOption[]>([]);
  protected readonly loadingOptions = signal(false);
  protected readonly chosenHorseId = signal<number | null>(null);
  protected readonly savingHorse = signal(false);

  protected readonly topicChanged = computed(() => this.topic() !== this.lesson().topic);
  protected readonly unassignedCount = computed(
    () => this.participants().filter((participant) => !participant.horse).length,
  );

  protected onTopicChange(event: Event) {
    this.topic.set((event.target as HTMLSelectElement).value as LessonType);
  }

  protected async saveTopic(): Promise<void> {
    this.savingTopic.set(true);
    this.clearMessages();
    try {
      const lesson = await this.coachLessonsService.updateTopic(this.lesson().id, {
        topic: this.topic(),
      });
      this.notice.set(`Sujet modifié : ${LESSON_TYPE_LABELS[lesson.topic]}.`);
      this.changed.emit(lesson);
    } catch (error) {
      this.error.set(this.errorMessage(error, TOPIC_CONFLICT));
    } finally {
      this.savingTopic.set(false);
    }
  }

  protected async openPicker(participant: LessonParticipant): Promise<void> {
    this.pickingFor.set(participant);
    this.chosenHorseId.set(participant.horse?.id ?? null);
    this.clearMessages();
    await this.loadOptions(participant);
  }

  protected closePicker() {
    this.pickingFor.set(null);
    this.options.set([]);
  }

  protected async assign(participant: LessonParticipant): Promise<void> {
    const horseId = this.chosenHorseId();
    if (horseId === null) {
      return;
    }
    await this.saveHorse(participant, () =>
      this.coachLessonsService.assignHorse(this.lesson().id, participant.id, { horseId }),
    );
  }

  protected async unassign(participant: LessonParticipant): Promise<void> {
    await this.saveHorse(participant, () =>
      this.coachLessonsService.unassignHorse(this.lesson().id, participant.id),
    );
  }

  protected optionDetails(option: HorseOption): string {
    return `${option.breed} · ${option.weightKg} kg · ${levelLabel(option.requiredLevel)}`;
  }

  protected optionWorkload(option: HorseOption): string {
    return workloadLabel(option.hoursToday, option.dailyHours);
  }

  protected optionReason(option: HorseOption): string | null {
    return horseUnavailabilityLabel(option);
  }

  private async saveHorse(
    participant: LessonParticipant,
    request: () => Promise<CoachLesson>,
  ): Promise<void> {
    this.savingHorse.set(true);
    this.clearMessages();
    try {
      const lesson = await request();
      const updated = lesson.participants?.find((p) => p.id === participant.id);
      this.notice.set(
        updated?.horse
          ? `${updated.horse.name} est attribué à ${fullName(participant)}.`
          : `${fullName(participant)} n'a plus de cheval attribué.`,
      );
      this.closePicker();
      this.changed.emit(lesson);
    } catch (error) {
      this.error.set(this.errorMessage(error, HORSE_CONFLICT));
      if ((error as HttpErrorResponse).status === 409) {
        await this.loadOptions(participant);
      }
    } finally {
      this.savingHorse.set(false);
    }
  }

  private async loadOptions(participant: LessonParticipant): Promise<void> {
    this.loadingOptions.set(true);
    try {
      const options = await this.coachLessonsService.getHorseOptions(
        this.lesson().id,
        participant.id,
      );
      if (this.pickingFor()?.id === participant.id) {
        this.options.set(options);
      }
    } catch (error) {
      this.options.set([]);
      this.error.set(this.errorMessage(error, HORSE_CONFLICT));
    } finally {
      this.loadingOptions.set(false);
    }
  }

  private clearMessages() {
    this.error.set(null);
    this.notice.set(null);
  }

  private errorMessage(error: unknown, conflict: string): string {
    const status = (error as HttpErrorResponse).status;
    if (status === 409) {
      return conflict;
    }
    return (
      COMMON_ERRORS[status] ??
      "La modification n'a pas pu être enregistrée. Vérifiez que le serveur est démarré."
    );
  }
}
