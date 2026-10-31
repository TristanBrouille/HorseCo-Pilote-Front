import { Role } from '../auth/authModel';
import { HorseOption, LessonStatus, LessonType } from '../coach-lessons/coachLessonModel';
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

export const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  CSO: 'CSO',
  DRESS: 'DRESS',
  TAP: 'TAP',
  ETHOLOGIE: 'ETHOLOGIE',
  MISE_EN_SELLE: 'MISE EN SELLE',
};

export const LESSON_STATUS_LABELS: Record<LessonStatus, { label: string; tone: BadgeTone }> = {
  PREVUE: { label: 'Prévue', tone: 'info' },
  ANNULEE: { label: 'Annulée', tone: 'danger' },
  TERMINEE: { label: 'Terminée', tone: 'neutral' },
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

// 'Lun. 12 oct.'
export const shortDateLabel = (date: Date) =>
  capitalize(
    new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).format(
      date,
    ),
  );

// 'Mercredi 14 octobre 2026'
export const longDateLabel = (date: Date) =>
  capitalize(
    new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date),
  );

// '12 octobre 2026'
export const dayMonthYearLabel = (date: Date) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);

export const ROLE_LABELS: Record<Role, { label: string; tone: BadgeTone }> = {
  MEMBRE: { label: 'Membre', tone: 'brand' },
  COACH: { label: 'Coach', tone: 'info' },
  ADMIN: { label: 'Admin', tone: 'danger' },
};

export const LOCATION_LABELS: Record<Location, string> = {
  CARRIERE: 'Carrière',
  PRE: 'Pré',
  MANEGE: 'Manège',
  BOX: 'Box',
  PADOCK: 'Padock',
};

export const LESSON_TYPES = Object.keys(LESSON_TYPE_LABELS) as LessonType[];

// '1/3 h'
export const workloadLabel = (hours: number, dailyHours: number) => `${hours}/${dailyHours} h`;

// Reason sent by the API (R14 to R19), worded for the coach; null when the horse is selectable.
export const horseUnavailabilityLabel = (option: HorseOption): string | null => {
  switch (option.reason) {
    case 'STATUS':
      return `Statut : ${HORSE_STATUS_LABELS[option.status].label}`;
    case 'LEVEL':
      return `Niveau requis : ${levelLabel(option.requiredLevel)}`;
    case 'WEIGHT':
      return 'Poids cavalier > 20 %';
    case 'ALREADY_ASSIGNED':
      return 'Déjà attribué sur ce créneau';
    case 'DAILY_HOURS':
      return `${workloadLabel(option.hoursToday, option.dailyHours)} aujourd'hui`;
    case 'CONSECUTIVE_HOURS':
      return '2 h consécutives : pause nécessaire';
    default:
      return null;
  }
};
