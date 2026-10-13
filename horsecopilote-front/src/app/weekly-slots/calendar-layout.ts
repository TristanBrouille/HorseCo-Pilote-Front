import { DayOfWeek, WeeklySlot } from '../model/weekly-slot';

export interface SlotBlock {
  slot: WeeklySlot;
  top: number;
  height: number;
  lane: number;
  lanes: number;
}

export interface DayColumn {
  day: DayOfWeek;
  blocks: SlotBlock[];
}

const EMPTY_RANGE = { first: 8, last: 20 };

const toHours = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours + minutes / 60;
};

const interval = (slot: WeeklySlot) => {
  const start = toHours(slot.startTime);
  const end = toHours(slot.endTime);
  return { start, end: end <= start ? 24 : end };
};

export function calendarHours(slots: WeeklySlot[]): number[] {
  const intervals = slots.map(interval);
  const first = intervals.length
    ? Math.floor(Math.min(...intervals.map((i) => i.start)))
    : EMPTY_RANGE.first;
  const last = intervals.length
    ? Math.ceil(Math.max(...intervals.map((i) => i.end)))
    : EMPTY_RANGE.last;
  return Array.from({ length: last - first }, (_, index) => first + index);
}

export function dayColumns(slots: WeeklySlot[], days: DayOfWeek[], firstHour: number): DayColumn[] {
  return days.map((day) => {
    const daySlots = slots
      .filter((slot) => slot.dayOfWeek === day)
      .map((slot) => ({ slot, ...interval(slot) }))
      .sort((a, b) => a.start - b.start || a.slot.id - b.slot.id);
    return {
      day,
      blocks: daySlots.map((current) => {
        const overlapping = daySlots.filter((o) => o.start < current.end && current.start < o.end);
        return {
          slot: current.slot,
          top: current.start - firstHour,
          height: current.end - current.start,
          lane: overlapping.indexOf(current),
          lanes: overlapping.length,
        };
      }),
    };
  });
}
