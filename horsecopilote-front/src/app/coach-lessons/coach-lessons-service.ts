import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  CoachLesson,
  HorseAssignmentRequest,
  HorseOption,
  LessonDetailsRequest,
  LessonUpdateRequest,
} from './coachLessonModel';

@Injectable({ providedIn: 'root' })
export class CoachLessonsService {
  private readonly baseUrl = 'http://localhost:8080/lessons';
  private readonly http = inject(HttpClient);

  // All the lessons of the week; weekStart: Monday, 'YYYY-MM-DD'.
  // The API flags the connected coach's lessons (mine) from the session.
  getWeek(weekStart: string): Promise<CoachLesson[]> {
    return firstValueFrom(this.http.get<CoachLesson[]>(this.baseUrl, { params: { weekStart } }));
  }

  // Only the coach of the lesson or an admin may change it (the API answers 403 otherwise).
  updateDetails(lessonId: number, request: LessonDetailsRequest): Promise<CoachLesson> {
    return firstValueFrom(this.http.patch<CoachLesson>(`${this.baseUrl}/${lessonId}`, request));
  }

  // Admin only: coach, location, topic and status of any lesson.
  updateLesson(lessonId: number, request: LessonUpdateRequest): Promise<CoachLesson> {
    return firstValueFrom(this.http.put<CoachLesson>(`${this.baseUrl}/${lessonId}`, request));
  }

  // Every horse of the centre, flagged selectable or not (with the reason) for this participant.
  getHorseOptions(lessonId: number, memberId: number): Promise<HorseOption[]> {
    return firstValueFrom(
      this.http.get<HorseOption[]>(
        `${this.baseUrl}/${lessonId}/participants/${memberId}/horse-options`,
      ),
    );
  }

  assignHorse(
    lessonId: number,
    memberId: number,
    request: HorseAssignmentRequest,
  ): Promise<CoachLesson> {
    return firstValueFrom(
      this.http.put<CoachLesson>(
        `${this.baseUrl}/${lessonId}/participants/${memberId}/horse`,
        request,
      ),
    );
  }

  unassignHorse(lessonId: number, memberId: number): Promise<CoachLesson> {
    return firstValueFrom(
      this.http.delete<CoachLesson>(`${this.baseUrl}/${lessonId}/participants/${memberId}/horse`),
    );
  }
}
