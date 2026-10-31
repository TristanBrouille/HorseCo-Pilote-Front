import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  LessonChangeRequest,
  LessonChangeRequestPayload,
  MemberLesson,
} from './myReservationModel';

@Injectable({ providedIn: 'root' })
export class MyReservationsService {
  private readonly baseUrl = 'http://localhost:8080/me/lessons';
  private readonly changeRequestsUrl = 'http://localhost:8080/me/lesson-change-requests';
  private readonly http = inject(HttpClient);

  getWeek(weekStart: string): Promise<MemberLesson[]> {
    return firstValueFrom(this.http.get<MemberLesson[]>(this.baseUrl, { params: { weekStart } }));
  }

  getChangeRequests(): Promise<LessonChangeRequest[]> {
    return firstValueFrom(this.http.get<LessonChangeRequest[]>(this.changeRequestsUrl));
  }

  createChangeRequest(request: LessonChangeRequestPayload): Promise<LessonChangeRequest> {
    return firstValueFrom(this.http.post<LessonChangeRequest>(this.changeRequestsUrl, request));
  }
}
