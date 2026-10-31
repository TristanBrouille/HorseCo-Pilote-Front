import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CoachLesson } from './coachLessonModel';

@Injectable({ providedIn: 'root' })
export class CoachLessonsService {
  private readonly baseUrl = 'http://localhost:8080/lessons';
  private readonly http = inject(HttpClient);

  // All the lessons of the week; weekStart: Monday, 'YYYY-MM-DD'.
  // The API flags the connected coach's lessons (mine) from the session.
  getWeek(weekStart: string): Promise<CoachLesson[]> {
    return firstValueFrom(this.http.get<CoachLesson[]>(this.baseUrl, { params: { weekStart } }));
  }
}
