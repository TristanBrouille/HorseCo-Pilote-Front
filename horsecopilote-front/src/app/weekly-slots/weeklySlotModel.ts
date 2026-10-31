import { Coach } from '../coaches/coachModel';
import { LessonType } from '../coach-lessons/coachLessonModel';
import { Location } from '../horses/horseModel';

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
  enrolledCount: number;
}

export interface SlotMember {
  id: number;
  firstName: string;
  lastName: string;
  galopLevel: number;
}

// POST /lessons/generation (admin): lessons of every slot from now until untilDate ('YYYY-MM-DD')
export interface LessonGenerationRequest {
  untilDate: string;
  topic: LessonType;
  location: Location;
}

// skippedCount: lessons that already existed, or whose coach was already teaching at that time
export interface LessonGenerationResult {
  fromDate: string;
  untilDate: string;
  createdCount: number;
  skippedCount: number;
  // members of the slots booked into the created lessons, without validation
  bookingCount: number;
}

export interface WeeklySlotRequest {
  coachId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  maxCapacity: number;
  requiredLevel: number;
}
