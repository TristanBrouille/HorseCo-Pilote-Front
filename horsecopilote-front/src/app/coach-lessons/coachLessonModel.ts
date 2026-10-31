import { Coach } from '../coaches/coachModel';
import { HorseStatus, Location } from '../horses/horseModel';

export type LessonType = 'CSO' | 'DRESS' | 'TAP' | 'ETHOLOGIE' | 'MISE_EN_SELLE';

export type LessonStatus = 'PREVUE' | 'ANNULEE' | 'TERMINEE';

export interface AssignedHorse {
  id: number;
  name: string;
}

export interface LessonParticipant {
  id: number;
  firstName: string;
  lastName: string;
  galopLevel: number;
  horse: AssignedHorse | null;
}

// A lesson of the week as seen by the connected coach or admin (GET /lessons).
// editable: the coach of the lesson, or an admin (every lesson).
// participants is null when the lesson is not editable (R11).
export interface CoachLesson {
  id: number;
  weeklySlotId: number | null;
  startDatetime: string;
  endDatetime: string;
  location: Location;
  topic: LessonType;
  status: LessonStatus;
  coach: Coach;
  mine: boolean;
  editable: boolean;
  hasPendingMembers: boolean;
  participantCount: number;
  participants: LessonParticipant[] | null;
}

// PATCH /lessons/{id}
export interface LessonTopicRequest {
  topic: LessonType;
}

// PUT /lessons/{id} (admin): cancelling releases the horses (R9)
export interface LessonUpdateRequest {
  coachId: number;
  location: Location;
  topic: LessonType;
  status: LessonStatus;
}

// PUT /lessons/{id}/participants/{memberId}/horse
export interface HorseAssignmentRequest {
  horseId: number;
}

// Why a horse cannot be given to the participant (R14 to R19), computed by the back.
export type HorseUnavailabilityReason =
  'STATUS' | 'LEVEL' | 'WEIGHT' | 'ALREADY_ASSIGNED' | 'DAILY_HOURS' | 'CONSECUTIVE_HOURS';

// GET /lessons/{id}/participants/{memberId}/horse-options (R20)
export interface HorseOption {
  id: number;
  name: string;
  breed: string;
  weightKg: number;
  requiredLevel: number;
  status: HorseStatus;
  dailyHours: number;
  hoursToday: number;
  assigned: boolean;
  selectable: boolean;
  reason: HorseUnavailabilityReason | null;
}
