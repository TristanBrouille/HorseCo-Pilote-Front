import { Coach } from '../coaches/coachModel';

export type DayOfWeek =
  'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface WeeklySlot {
  id: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  requiredLevel: number;
  coach: Coach;
}

export interface WeeklySlotRequest {
  coachId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  maxCapacity: number;
  requiredLevel: number;
}
