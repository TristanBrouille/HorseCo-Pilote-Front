import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LessonChangeRequest } from '../my-reservations/myReservationModel';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly changeRequestsUrl = 'http://localhost:8080/lesson-change-requests';
  private readonly http = inject(HttpClient);

  getPendingChangeRequests(): Promise<LessonChangeRequest[]> {
    return firstValueFrom(this.http.get<LessonChangeRequest[]>(this.changeRequestsUrl));
  }

  acceptChangeRequest(id: number): Promise<LessonChangeRequest> {
    return firstValueFrom(
      this.http.post<LessonChangeRequest>(`${this.changeRequestsUrl}/${id}/accept`, null),
    );
  }

  refuseChangeRequest(id: number): Promise<LessonChangeRequest> {
    return firstValueFrom(
      this.http.post<LessonChangeRequest>(`${this.changeRequestsUrl}/${id}/refuse`, null),
    );
  }
}
