import { HorseStatus, Location } from '../horses/horseModel';
import { DayOfWeek } from '../weekly-slots/weeklySlotModel';
import { BadgeTone } from './badge/badge';

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

export const HORSE_STATUS_LABELS: Record<HorseStatus, { label: string; tone: BadgeTone }> = {
  DISPONIBLE: { label: 'Disponible', tone: 'success' },
  REPOS: { label: 'Repos', tone: 'neutral' },
  PRE: { label: 'Au pré', tone: 'brand' },
  CONVALESCENCE: { label: 'Convalescence', tone: 'warning' },
};

export const LOCATION_LABELS: Record<Location, string> = {
  CARRIERE: 'Carrière',
  PRE: 'Pré',
  MANEGE: 'Manège',
  BOX: 'Box',
  PADOCK: 'Padock',
};
