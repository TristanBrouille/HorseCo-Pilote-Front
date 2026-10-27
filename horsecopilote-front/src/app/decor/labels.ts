import { DayOfWeek } from '../weekly-slots/weeklySlotModel';

export const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Lundi',
  TUESDAY: 'Mardi',
  WEDNESDAY: 'Mercredi',
  THURSDAY: 'Jeudi',
  FRIDAY: 'Vendredi',
  SATURDAY: 'Samedi',
  SUNDAY: 'Dimanche',
};

export const levelLabel = (level: number) => `Galop ${level}`;

export const timeRange = (start: string, end: string) =>
  `${start.slice(0, 5)} – ${end.slice(0, 5)}`;
