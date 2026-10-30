import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { Button } from '../decor/button/button';
import { Field } from '../decor/field/field';
import { ActionsCell, ActionsCellParams } from '../decor/grid/actions-cell';
import { BadgeCell } from '../decor/grid/badge-cell';
import { hcGridTheme } from '../decor/grid/hc-grid-theme';
import { HORSE_STATUS_LABELS, LOCATION_LABELS, levelLabel } from '../decor/labels';
import { Modal } from '../decor/modal/modal';
import { PageHeader } from '../decor/page-header/page-header';
import { Horse, HorseRequest, HorseStatus, Location } from './horseModel';
import { HorsesService } from './horses-service';

const SAVE_ERRORS: Record<number, string> = {
  400: 'Certaines valeurs sont invalides.',
  403: 'Seul un administrateur peut gérer les chevaux.',
  404: "Ce cheval n'existe plus. Rechargez la page.",
  409: 'Ce cheval est attribué à des leçons : il ne peut pas être supprimé.',
};

// Bounds also enforced by the API (HorseRequestDto).
const LIMITS = {
  heightCm: [80, 220, 'Entre 80 et 220 cm.'],
  weightKg: [100, 1200, 'Entre 100 et 1200 kg.'],
  dailyHours: [1, 3, 'Entre 1 et 3 heures.'],
  requiredLevel: [1, 7, 'Entre Galop 1 et Galop 7.'],
} as const;

@Component({
  selector: 'app-horses',
  imports: [ReactiveFormsModule, AgGridAngular, Button, Field, Modal, PageHeader],
  templateUrl: './horses.html',
  styleUrl: './horses.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Horses implements OnInit {
  private readonly horsesService = inject(HorsesService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly theme = hcGridTheme;
  protected readonly statusLabels = HORSE_STATUS_LABELS;
  protected readonly locationLabels = LOCATION_LABELS;
  protected readonly statuses = Object.keys(HORSE_STATUS_LABELS) as HorseStatus[];
  protected readonly locations = Object.keys(LOCATION_LABELS) as Location[];
  protected readonly localeText = { noRowsToShow: 'Aucun cheval pour le moment.' };

  protected readonly columns: ColDef<Horse>[] = [
    { headerName: 'Nom', field: 'name', cellClass: 'hc-cell-strong', flex: 1.2 },
    { headerName: 'Race', field: 'breed', flex: 1.2 },
    {
      headerName: 'Statut',
      field: 'status',
      valueFormatter: (p) => HORSE_STATUS_LABELS[p.value as HorseStatus].label,
      cellRendererSelector: (p) => ({
        component: BadgeCell,
        params: { tone: HORSE_STATUS_LABELS[p.value as HorseStatus].tone },
      }),
      flex: 1,
    },
    {
      headerName: 'Lieu',
      field: 'location',
      valueFormatter: (p) => LOCATION_LABELS[p.value as Location],
      flex: 1,
    },
    {
      headerName: 'Niveau requis',
      field: 'requiredLevel',
      valueFormatter: (p) => levelLabel(p.value),
      cellRenderer: BadgeCell,
      cellRendererParams: { tone: 'brand' },
      flex: 1,
    },
    { headerName: 'Taille', field: 'heightCm', valueFormatter: (p) => `${p.value} cm`, flex: 0.8 },
    { headerName: 'Poids', field: 'weightKg', valueFormatter: (p) => `${p.value} kg`, flex: 0.8 },
    {
      headerName: 'Heures / jour',
      field: 'dailyHours',
      valueFormatter: (p) => `${p.value} h`,
      flex: 0.9,
    },
    {
      headerName: 'Actions',
      headerClass: 'hc-header-hidden',
      cellRenderer: ActionsCell,
      cellRendererParams: {
        actions: [
          { label: 'Modifier', run: (horse) => this.openEdit(horse) },
          { label: 'Supprimer', run: (horse) => this.askDelete(horse) },
        ],
      } satisfies Partial<ActionsCellParams<Horse>>,
      sortable: false,
      width: 240,
    },
  ];

  protected readonly horses = signal<Horse[]>([]);
  protected readonly loadError = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);
  protected readonly saving = signal(false);

  protected readonly formOpen = signal(false);
  protected readonly editedHorse = signal<Horse | null>(null);
  protected readonly deleteOpen = signal(false);
  protected readonly horseToDelete = signal<Horse | null>(null);

  protected readonly form = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
    breed: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
    heightCm: this.fb.control(160, this.bounds('heightCm')),
    weightKg: this.fb.control(500, this.bounds('weightKg')),
    dailyHours: this.fb.control(3, this.bounds('dailyHours')),
    status: this.fb.control<HorseStatus>('DISPONIBLE', Validators.required),
    location: this.fb.control<Location>('BOX', Validators.required),
    requiredLevel: this.fb.control(1, this.bounds('requiredLevel')),
  });

  async ngOnInit(): Promise<void> {
    await this.loadHorses();
  }

  protected openCreate() {
    this.editedHorse.set(null);
    this.form.reset();
    this.actionError.set(null);
    this.formOpen.set(true);
  }

  protected openEdit(horse: Horse) {
    const { id, ...values } = horse;
    this.editedHorse.set(horse);
    this.form.setValue(values);
    this.actionError.set(null);
    this.formOpen.set(true);
  }

  protected async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const request: HorseRequest = this.form.getRawValue();
    const edited = this.editedHorse();
    await this.run(
      () =>
        edited ? this.horsesService.update(edited.id, request) : this.horsesService.create(request),
      this.formOpen,
    );
  }

  protected askDelete(horse: Horse) {
    this.horseToDelete.set(horse);
    this.actionError.set(null);
    this.deleteOpen.set(true);
  }

  protected async confirmDelete(): Promise<void> {
    await this.run(() => this.horsesService.delete(this.horseToDelete()!.id), this.deleteOpen);
  }

  protected fieldError(name: keyof HorseRequest): string | null {
    const control = this.form.controls[name];
    if (!control.touched || control.valid) {
      return null;
    }
    if (control.hasError('required')) {
      return 'Champ obligatoire.';
    }
    return name in LIMITS ? LIMITS[name as keyof typeof LIMITS][2] : '100 caractères au maximum.';
  }

  private bounds(name: keyof typeof LIMITS) {
    const [min, max] = LIMITS[name];
    return [Validators.required, Validators.min(min), Validators.max(max)];
  }

  private async run(action: () => Promise<unknown>, modalOpen: { set(open: boolean): void }) {
    this.saving.set(true);
    this.actionError.set(null);
    try {
      await action();
      modalOpen.set(false);
      await this.loadHorses();
    } catch (error) {
      const status = (error as HttpErrorResponse).status;
      this.actionError.set(SAVE_ERRORS[status] ?? "L'opération a échoué. Réessayez.");
    } finally {
      this.saving.set(false);
    }
  }

  private async loadHorses(): Promise<void> {
    try {
      this.horses.set(await this.horsesService.getAll());
      this.loadError.set(null);
    } catch {
      this.loadError.set('Impossible de charger les chevaux. Vérifiez que le serveur est démarré.');
    }
  }
}
