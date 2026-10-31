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

export type LessonChangeRequestStatus = 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';

export interface LessonChangeRequestPayload {
  fromLessonId: number;
  toLessonId: number;
  reason: string;
}

export interface LessonChangeRequest {
  id: number;
  memberFirstName: string;
  memberLastName: string;
  fromLessonId: number;
  fromStartDatetime: string;
  fromTopic: LessonType;
  toLessonId: number;
  toStartDatetime: string;
  toTopic: LessonType;
  reason: string;
  status: LessonChangeRequestStatus;
  createdAt: string;
}
