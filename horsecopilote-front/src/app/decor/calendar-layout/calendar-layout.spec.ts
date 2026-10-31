import { WeeklySlot } from '../../weekly-slots/weeklySlotModel';
import { calendarHours, dayColumns } from './calendar-layout';

const slot = (id: number, dayOfWeek: WeeklySlot['dayOfWeek'], start: string, end: string) =>
  ({
    id,
    dayOfWeek,
    startTime: `${start}:00`,
    endTime: `${end}:00`,
    maxCapacity: 12,
    requiredLevel: 1,
    coach: { id: id, firstName: 'C', lastName: `${id}` },
  }) satisfies WeeklySlot;

describe('calendar layout', () => {
  it('spans the hours from the earliest start to the latest end', () => {
    expect(
      calendarHours([slot(1, 'MONDAY', '18:30', '19:30'), slot(2, 'FRIDAY', '10:00', '11:00')]),
    ).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });

  it('shows a default day when there is no slot', () => {
    expect(calendarHours([])).toEqual([8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });

  it('places a slot at its start time, one hour high', () => {
    const [monday] = dayColumns([slot(1, 'MONDAY', '18:30', '19:30')], ['MONDAY'], 18);

    expect(monday.blocks[0]).toMatchObject({ top: 0.5, height: 1, lane: 0, lanes: 1 });
  });

  it('puts simultaneous slots of different coaches side by side', () => {
    const [monday, tuesday] = dayColumns(
      [
        slot(1, 'MONDAY', '18:00', '19:00'),
        slot(2, 'MONDAY', '18:30', '19:30'),
        slot(3, 'TUESDAY', '18:00', '19:00'),
      ],
      ['MONDAY', 'TUESDAY'],
      18,
    );

    expect(monday.blocks.map((b) => [b.lane, b.lanes])).toEqual([
      [0, 2],
      [1, 2],
    ]);
    expect(tuesday.blocks.map((b) => [b.lane, b.lanes])).toEqual([[0, 1]]);
  });

  it('keeps back-to-back slots in a single lane', () => {
    const [monday] = dayColumns(
      [slot(1, 'MONDAY', '18:00', '19:00'), slot(2, 'MONDAY', '19:00', '20:00')],
      ['MONDAY'],
      18,
    );

    expect(monday.blocks.map((b) => b.lanes)).toEqual([1, 1]);
  });
});
