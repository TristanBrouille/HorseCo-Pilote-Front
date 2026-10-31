import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { WeeklySlot } from './weeklySlotModel';
import { WeeklySlots } from './weekly-slots';

const API_URL = 'http://localhost:8080';

const SLOT: WeeklySlot = {
  id: 1,
  dayOfWeek: 'MONDAY',
  startTime: '18:00:00',
  endTime: '19:00:00',
  maxCapacity: 12,
  requiredLevel: 3,
  coach: { id: 7, firstName: 'Claire', lastName: 'Durand' },
  enrolledCount: 1,
};

const ENROLLED = { id: 5, firstName: 'Léa', lastName: 'Martin', galopLevel: 4 };
const CANDIDATE = { id: 6, firstName: 'Hugo', lastName: 'Petit', galopLevel: 3 };

// jsdom does not implement the modal <dialog> API that browsers provide.
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.open = true;
};
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  this.open = false;
  this.dispatchEvent(new Event('close'));
};

describe('WeeklySlots', () => {
  let http: HttpTestingController;
  let fixture: ComponentFixture<WeeklySlots>;
  let root: HTMLElement;

  async function settle() {
    // Services return promises: let them resolve before checking the view.
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
  }

  async function click(element: HTMLElement) {
    element.click();
    await settle();
  }

  function button(label: string) {
    return [...root.querySelectorAll('button')]
      .filter((b) => b.textContent?.trim() === label)
      .at(-1)!;
  }

  async function chooseCoach() {
    const select = root.querySelector<HTMLSelectElement>('select[formcontrolname="coachId"]')!;
    select.selectedIndex = 1;
    select.dispatchEvent(new Event('change'));
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [WeeklySlots],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(WeeklySlots);
    fixture.detectChanges();
    root = fixture.nativeElement;
    http.expectOne(`${API_URL}/weekly-slots`).flush([SLOT]);
    http.expectOne(`${API_URL}/coaches`).flush([SLOT.coach]);
    await settle();
  });

  afterEach(() => http.verify());

  it('shows the slots in a weekly calendar, in the column of their day', () => {
    const headers = [...root.querySelectorAll('.day-header')].map((h) => h.textContent?.trim());
    expect(headers).toEqual([
      'Lundi',
      'Mardi',
      'Mercredi',
      'Jeudi',
      'Vendredi',
      'Samedi',
      'Dimanche',
    ]);

    const block = root.querySelector<HTMLElement>('[aria-label="Lundi"] .slot-block')!;
    expect(block.textContent).toContain('18:00 – 19:00');
    expect(block.textContent).toContain('Claire Durand');
    expect(block.textContent).toContain('Galop 3');
    expect(block.textContent).toContain('1/12 places');
  });

  it('creates a slot from the header button and reloads the calendar', async () => {
    await click(button('Ajouter un créneau'));
    await chooseCoach();

    await click(button('Ajouter le créneau'));

    const request = http.expectOne({ method: 'POST', url: `${API_URL}/weekly-slots` });
    expect(request.request.body).toEqual({
      coachId: 7,
      dayOfWeek: 'MONDAY',
      startTime: '18:00',
      maxCapacity: 12,
      requiredLevel: 1,
    });
    request.flush(SLOT);
    await settle();
    http.expectOne(`${API_URL}/weekly-slots`).flush([SLOT]);
  });

  it('prefills the day and hour when an empty cell is clicked', async () => {
    await click(
      root.querySelector<HTMLElement>('[aria-label="Ajouter un créneau le Mardi à 18:00"]')!,
    );
    await chooseCoach();

    await click(button('Ajouter le créneau'));

    const request = http.expectOne({ method: 'POST', url: `${API_URL}/weekly-slots` });
    expect(request.request.body).toMatchObject({ dayOfWeek: 'TUESDAY', startTime: '18:00' });
    request.flush(SLOT);
    await settle();
    http.expectOne(`${API_URL}/weekly-slots`).flush([SLOT]);
  });

  it('prefills a half-hour start when the lower half of a cell is clicked', async () => {
    await click(
      root.querySelector<HTMLElement>('[aria-label="Ajouter un créneau le Mardi à 18:30"]')!,
    );
    await chooseCoach();

    await click(button('Ajouter le créneau'));

    const request = http.expectOne({ method: 'POST', url: `${API_URL}/weekly-slots` });
    expect(request.request.body).toMatchObject({ dayOfWeek: 'TUESDAY', startTime: '18:30' });
    request.flush(SLOT);
    await settle();
    http.expectOne(`${API_URL}/weekly-slots`).flush([SLOT]);
  });

  it('does not send an incomplete form', async () => {
    await click(button('Ajouter un créneau'));

    await click(button('Ajouter le créneau'));

    expect(root.textContent).toContain('Champ obligatoire.');
    http.expectNone({ method: 'POST' });
  });

  async function openSlot() {
    await click(root.querySelector<HTMLElement>('.slot-block')!);
    http.expectOne(`${API_URL}/weekly-slots/1/members`).flush([ENROLLED]);
    await settle();
    http.expectOne(`${API_URL}/weekly-slots/1/eligible-members`).flush([CANDIDATE]);
    await settle();
    http.expectOne(`${API_URL}/weekly-slots`).flush([SLOT]);
    await settle();
  }

  it('lists the enrolled members and adds an eligible one', async () => {
    await openSlot();
    expect(root.querySelector('.member-list')!.textContent).toContain('Léa Martin');

    const select = root.querySelector<HTMLSelectElement>('select[aria-label="Membre à ajouter"]')!;
    select.value = '6';
    select.dispatchEvent(new Event('change'));
    await settle();
    await click(button('Ajouter'));

    http
      .expectOne({ method: 'POST', url: `${API_URL}/weekly-slots/1/members/6` })
      .flush([CANDIDATE, ENROLLED]);
    await settle();
    http.expectOne(`${API_URL}/weekly-slots/1/eligible-members`).flush([]);
    await settle();
    http.expectOne(`${API_URL}/weekly-slots`).flush([{ ...SLOT, enrolledCount: 2 }]);
    await settle();

    expect(root.querySelector('.member-list')!.textContent).toContain('Hugo Petit');
    expect(root.textContent).toContain('Aucun membre éligible');
  });

  it('removes an enrolled member', async () => {
    await openSlot();

    await click(root.querySelector<HTMLElement>('[aria-label="Retirer Léa Martin"]')!);

    http.expectOne({ method: 'DELETE', url: `${API_URL}/weekly-slots/1/members/5` }).flush([]);
    await settle();
    http.expectOne(`${API_URL}/weekly-slots/1/eligible-members`).flush([CANDIDATE, ENROLLED]);
    await settle();
    http.expectOne(`${API_URL}/weekly-slots`).flush([{ ...SLOT, enrolledCount: 0 }]);
    await settle();

    expect(root.textContent).toContain('Aucun membre inscrit.');
  });

  it('explains a coach overlap returned by the server', async () => {
    await openSlot();

    await click(button('Enregistrer'));
    http
      .expectOne({ method: 'PUT', url: `${API_URL}/weekly-slots/1` })
      .flush({ detail: 'overlap' }, { status: 409, statusText: 'Conflict' });
    await settle();

    expect(root.textContent).toContain('Ce coach a déjà un créneau qui chevauche cet horaire');
  });

  it('deletes a slot after confirmation', async () => {
    await openSlot();
    await click(button('Supprimer le créneau'));

    await click(button('Supprimer'));

    http.expectOne({ method: 'DELETE', url: `${API_URL}/weekly-slots/1` }).flush(null);
    await settle();
    http.expectOne(`${API_URL}/weekly-slots`).flush([]);
  });
});
