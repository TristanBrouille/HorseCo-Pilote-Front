import { AssignedHorse, LessonStatus, LessonType } from '../coach-lessons/coachLessonModel';
import { Coach } from '../coaches/coachModel';
import { Location } from '../horses/horseModel';

export interface MemberLesson {
  id: number;
  weeklySlotId: number | null;
  startDatetime: string;
  endDatetime: string;
  location: Location;
  topic: LessonType;
  status: LessonStatus;
  coach: Coach;
  mine: boolean;
  horse: AssignedHorse | null;
}
