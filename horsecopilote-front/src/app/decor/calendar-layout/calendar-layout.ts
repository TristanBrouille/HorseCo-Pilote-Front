import { DayOfWeek } from '../../weekly-slots/weeklySlotModel';

// Anything shown in the weekly calendar: a weekly slot, a lesson of a given week...
export interface CalendarEntry {
  id: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface CalendarBlock<T extends CalendarEntry> {
  item: T;
  top: number;
  height: number;
  lane: number;
  lanes: number;
}

export interface DayColumn<T extends CalendarEntry> {
  day: DayOfWeek;
  blocks: CalendarBlock<T>[];
}

const EMPTY_RANGE = { first: 8, last: 20 };

const toHours = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours + minutes / 60;
};

const interval = (entry: CalendarEntry) => {
  const start = toHours(entry.startTime);
  const end = toHours(entry.endTime);
  return { start, end: end <= start ? 24 : end };
};

export function calendarHours(entries: CalendarEntry[]): number[] {
  const intervals = entries.map(interval);
  const first = intervals.length
    ? Math.floor(Math.min(...intervals.map((i) => i.start)))
    : EMPTY_RANGE.first;
  const last = intervals.length
    ? Math.ceil(Math.max(...intervals.map((i) => i.end)))
    : EMPTY_RANGE.last;
  return Array.from({ length: last - first }, (_, index) => first + index);
}

export function dayColumns<T extends CalendarEntry>(
  entries: T[],
  days: DayOfWeek[],
  firstHour: number,
): DayColumn<T>[] {
  return days.map((day) => {
    const dayEntries = entries
      .filter((entry) => entry.dayOfWeek === day)
      .map((entry) => ({ item: entry, ...interval(entry) }))
      .sort((a, b) => a.start - b.start || a.item.id - b.item.id);
    return {
      day,
      blocks: dayEntries.map((current) => {
        const overlapping = dayEntries.filter(
          (o) => o.start < current.end && current.start < o.end,
        );
        return {
          item: current.item,
          top: current.start - firstHour,
          height: current.end - current.start,
          lane: overlapping.indexOf(current),
          lanes: overlapping.length,
        };
      }),
    };
  });
}
