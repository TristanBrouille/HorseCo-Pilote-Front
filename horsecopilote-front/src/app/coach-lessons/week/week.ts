import { DayOfWeek } from '../../weekly-slots/weeklySlotModel';

// Calendar dates handled in local time, without time zone: the API sends 'YYYY-MM-DDTHH:mm:ss'.

const JS_DAYS: DayOfWeek[] = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

const pad = (value: number) => String(value).padStart(2, '0');

export const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// 'YYYY-MM-DD' (or the date part of a date-time) -> local Date, null when invalid
export function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) {
    return null;
  }
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  return date.getMonth() === month - 1 ? date : null;
}

export const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

export const mondayOf = (date: Date) => addDays(date, -((date.getDay() + 6) % 7));

export const dayOfWeekOf = (date: Date) => JS_DAYS[date.getDay()];

// '2026-10-14T17:00:00' -> '17:00'
export const timeOf = (dateTime: string) => dateTime.slice(11, 16);
