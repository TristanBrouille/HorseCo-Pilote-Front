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
import { CoachesService } from '../coaches/coaches-service';
import { Badge } from '../decor/badge/badge';
import { Button } from '../decor/button/button';
import { Field } from '../decor/field/field';
import { DAY_LABELS, levelLabel, timeRange } from '../decor/labels';
import { Modal } from '../decor/modal/modal';
import { PageHeader } from '../decor/page-header/page-header';
import { Coach } from '../coaches/coachModel';
import { DayOfWeek, SlotMember, WeeklySlot, WeeklySlotRequest } from './weeklySlotModel';
import { calendarHours, dayColumns } from '../decor/calendar-layout/calendar-layout';
import { WeeklySlotsService } from './weekly-slots-service';

const SAVE_ERRORS: Record<number, string> = {
  400: 'Certaines valeurs sont invalides.',
  403: 'Seul un administrateur peut modifier les créneaux.',
  404: "Ce coach ou ce créneau n'existe plus. Rechargez la page.",
  409: 'Ce coach a déjà un créneau qui chevauche cet horaire, ou un membre inscrit ne respecte plus les places, le niveau ou ses autres horaires.',
};

const MEMBER_ERRORS: Record<number, string> = {
  403: 'Seul un administrateur peut gérer les inscrits.',
  404: "Ce membre ou ce créneau n'existe plus. Rechargez la page.",
  409: 'Ce membre ne peut pas être ajouté : créneau complet, niveau insuffisant ou déjà inscrit sur cet horaire.',
};

@Component({
  selector: 'app-weekly-slots',
  imports: [ReactiveFormsModule, Badge, Button, Field, Modal, PageHeader],
  templateUrl: './weekly-slots.html',
  styleUrl: './weekly-slots.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklySlots implements OnInit {
  private readonly weeklySlotsService = inject(WeeklySlotsService);
  private readonly coachesService = inject(CoachesService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly dayLabels = DAY_LABELS;
  protected readonly days = Object.keys(DAY_LABELS) as DayOfWeek[];
  protected readonly timeRange = timeRange;

  protected readonly levelLabel = levelLabel;
  // 18.5 -> '18:30'
  protected readonly timeLabel = (time: number) =>
    `${String(Math.floor(time)).padStart(2, '0')}:${time % 1 ? '30' : '00'}`;
  // slots start on the hour or half hour (also enforced by the API)
  protected readonly startTimes = Array.from({ length: 48 }, (_, i) => this.timeLabel(i / 2));

  protected readonly slots = signal<WeeklySlot[]>([]);
  protected readonly hours = computed(() => calendarHours(this.slots()));
  protected readonly halfHours = computed(() => this.hours().flatMap((hour) => [hour, hour + 0.5]));
  protected readonly columns = computed(() => dayColumns(this.slots(), this.days, this.hours()[0]));
  protected readonly coaches = signal<Coach[]>([]);
  protected readonly loadError = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);
  protected readonly saving = signal(false);

  protected formOpen = signal(false);
  protected readonly editedSlot = signal<WeeklySlot | null>(null);
  protected deleteOpen = signal(false);
  protected readonly slotToDelete = signal<WeeklySlot | null>(null);
  protected readonly slotMembers = signal<SlotMember[]>([]);
  // computed by the API (level, capacity, overlaps): the front only displays it
  protected readonly eligibleMembers = signal<SlotMember[]>([]);
  protected readonly selectedMemberId = signal<number | null>(null);
  protected readonly memberError = signal<string | null>(null);

  protected readonly form = this.fb.group({
    coachId: this.fb.control<number | null>(null, Validators.required),
    dayOfWeek: this.fb.control<DayOfWeek>('MONDAY', Validators.required),
    startTime: this.fb.control('18:00', Validators.required),
    maxCapacity: this.fb.control(12, [Validators.required, Validators.min(1), Validators.max(12)]),
    requiredLevel: this.fb.control(1, [Validators.required, Validators.min(0), Validators.max(7)]),
  });

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadSlots(), this.loadCoaches()]);
  }

  protected openCreate(dayOfWeek?: DayOfWeek, time?: number) {
    this.editedSlot.set(null);
    this.form.reset();
    if (dayOfWeek && time !== undefined) {
      this.form.patchValue({ dayOfWeek, startTime: this.timeLabel(time) });
    }
    this.actionError.set(null);
    this.formOpen.set(true);
  }

  protected openEdit(slot: WeeklySlot) {
    this.editedSlot.set(slot);
    this.form.setValue({
      coachId: slot.coach.id,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime.slice(0, 5),
      maxCapacity: slot.maxCapacity,
      requiredLevel: slot.requiredLevel,
    });
    this.actionError.set(null);
    this.memberError.set(null);
    this.slotMembers.set([]);
    this.eligibleMembers.set([]);
    this.formOpen.set(true);
    this.runMemberAction(() => this.weeklySlotsService.getMembers(slot.id));
  }

  protected addMember() {
    const memberId = this.selectedMemberId();
    if (memberId !== null) {
      this.runMemberAction(() =>
        this.weeklySlotsService.addMember(this.editedSlot()!.id, memberId),
      );
    }
  }

  protected removeMember(member: SlotMember) {
    this.runMemberAction(() =>
      this.weeklySlotsService.removeMember(this.editedSlot()!.id, member.id),
    );
  }

  private async runMemberAction(action: () => Promise<SlotMember[]>): Promise<void> {
    const slotId = this.editedSlot()!.id;
    this.saving.set(true);
    this.memberError.set(null);
    try {
      this.slotMembers.set(await action());
      this.eligibleMembers.set(await this.weeklySlotsService.getEligibleMembers(slotId));
      this.selectedMemberId.set(null);
      await this.loadSlots();
    } catch (error) {
      const status = (error as HttpErrorResponse).status;
      this.memberError.set(MEMBER_ERRORS[status] ?? "L'opération a échoué. Réessayez.");
    } finally {
      this.saving.set(false);
    }
  }

  protected async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const request = this.form.getRawValue() as WeeklySlotRequest;
    const edited = this.editedSlot();
    await this.run(
      () =>
        edited
          ? this.weeklySlotsService.update(edited.id, request)
          : this.weeklySlotsService.create(request),
      this.formOpen,
    );
  }

  protected askDelete(slot: WeeklySlot) {
    this.formOpen.set(false);
    this.slotToDelete.set(slot);
    this.actionError.set(null);
    this.deleteOpen.set(true);
  }

  protected async confirmDelete(): Promise<void> {
    await this.run(() => this.weeklySlotsService.delete(this.slotToDelete()!.id), this.deleteOpen);
  }

  protected fieldError(name: keyof WeeklySlotRequest): string | null {
    const control = this.form.controls[name];
    if (!control.touched || control.valid) {
      return null;
    }
    if (control.hasError('required')) {
      return 'Champ obligatoire.';
    }
    return name === 'maxCapacity' ? 'Entre 1 et 12 places.' : 'Entre Galop 0 et Galop 7.';
  }

  private async run(action: () => Promise<unknown>, modalOpen: { set(open: boolean): void }) {
    this.saving.set(true);
    this.actionError.set(null);
    try {
      await action();
      modalOpen.set(false);
      await this.loadSlots();
    } catch (error) {
      const status = (error as HttpErrorResponse).status;
      this.actionError.set(SAVE_ERRORS[status] ?? "L'opération a échoué. Réessayez.");
    } finally {
      this.saving.set(false);
    }
  }

  private async loadSlots(): Promise<void> {
    try {
      this.slots.set(await this.weeklySlotsService.getAll());
      this.loadError.set(null);
    } catch {
      this.loadError.set(
        'Impossible de charger les créneaux. Vérifiez que le serveur est démarré.',
      );
    }
  }

  private async loadCoaches(): Promise<void> {
    try {
      this.coaches.set(await this.coachesService.getAll());
    } catch {
      this.loadError.set('Impossible de charger la liste des coachs.');
    }
  }
}
