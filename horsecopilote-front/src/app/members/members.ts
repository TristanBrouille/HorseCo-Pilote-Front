import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { Button } from '../decor/button/button';
import { Field } from '../decor/field/field';
import { BadgeCell } from '../decor/grid/badge-cell';
import { hcGridTheme } from '../decor/grid/hc-grid-theme';
import { levelLabel } from '../decor/labels';
import { Modal } from '../decor/modal/modal';
import { PageHeader } from '../decor/page-header/page-header';
import { Member, MemberRequest } from './memberModel';
import { MembersService } from './members-service';

const SAVE_ERRORS: Record<number, string> = {
  400: 'Certaines valeurs sont invalides.',
  403: 'Seul un administrateur peut ajouter des membres.',
  409: 'Cet email est déjà utilisé par un autre compte.',
};

// Bounds also enforced by the API (MemberRequestDto).
const LIMITS = {
  galopLevel: [0, 7, 'Entre Galop 0 et Galop 7.'],
  heightCm: [80, 220, 'Entre 80 et 220 cm.'],
  weightKg: [15, 150, 'Entre 15 et 150 kg.'],
} as const;

@Component({
  selector: 'app-members',
  imports: [ReactiveFormsModule, AgGridAngular, Button, Field, Modal, PageHeader],
  templateUrl: './members.html',
  styleUrl: './members.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Members implements OnInit {
  private readonly membersService = inject(MembersService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly theme = hcGridTheme;
  protected readonly localeText = { noRowsToShow: 'Aucun membre pour le moment.' };

  protected readonly columns: ColDef<Member>[] = [
    { headerName: 'Nom', field: 'lastName', cellClass: 'hc-cell-strong', flex: 1 },
    { headerName: 'Prénom', field: 'firstName', flex: 1 },
    { headerName: 'Email', field: 'email', flex: 1.6 },
    {
      headerName: 'Niveau',
      field: 'galopLevel',
      valueFormatter: (p) => levelLabel(p.value),
      cellRenderer: BadgeCell,
      cellRendererParams: { tone: 'brand' },
      flex: 0.8,
    },
    { headerName: 'Taille', field: 'heightCm', valueFormatter: (p) => `${p.value} cm`, flex: 0.7 },
    { headerName: 'Poids', field: 'weightKg', valueFormatter: (p) => `${p.value} kg`, flex: 0.7 },
  ];

  protected readonly members = signal<Member[]>([]);
  protected readonly loadError = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly formOpen = signal(false);

  protected readonly form = this.fb.group({
    firstName: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
    lastName: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
    email: this.fb.control('', [Validators.required, Validators.email, Validators.maxLength(255)]),
    password: this.fb.control('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(72),
    ]),
    galopLevel: this.fb.control(1, this.bounds('galopLevel')),
    heightCm: this.fb.control(160, this.bounds('heightCm')),
    weightKg: this.fb.control(55, this.bounds('weightKg')),
  });

  async ngOnInit(): Promise<void> {
    await this.loadMembers();
  }

  protected openCreate() {
    this.form.reset();
    this.actionError.set(null);
    this.formOpen.set(true);
  }

  protected async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const request: MemberRequest = this.form.getRawValue();
    this.saving.set(true);
    this.actionError.set(null);
    try {
      await this.membersService.create(request);
      this.formOpen.set(false);
      await this.loadMembers();
    } catch (error) {
      const status = (error as HttpErrorResponse).status;
      this.actionError.set(SAVE_ERRORS[status] ?? "L'ajout a échoué. Réessayez.");
    } finally {
      this.saving.set(false);
    }
  }

  protected fieldError(name: keyof MemberRequest): string | null {
    const control = this.form.controls[name];
    if (!control.touched || control.valid) {
      return null;
    }
    if (control.hasError('required')) {
      return 'Champ obligatoire.';
    }
    if (name in LIMITS) {
      return LIMITS[name as keyof typeof LIMITS][2];
    }
    if (control.hasError('email')) {
      return "Format d'email invalide.";
    }
    if (name === 'password') {
      return 'Entre 8 et 72 caractères.';
    }
    return '100 caractères au maximum.';
  }

  private bounds(name: keyof typeof LIMITS) {
    const [min, max] = LIMITS[name];
    return [Validators.required, Validators.min(min), Validators.max(max)];
  }

  private async loadMembers(): Promise<void> {
    try {
      this.members.set(await this.membersService.getAll());
      this.loadError.set(null);
    } catch {
      this.loadError.set('Impossible de charger les membres. Vérifiez que le serveur est démarré.');
    }
  }
}
