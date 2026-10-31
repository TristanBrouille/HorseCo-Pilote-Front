import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MemberLesson } from './myReservationModel';

@Injectable({ providedIn: 'root' })
export class MyReservationsService {
  private readonly baseUrl = 'http://localhost:8080/me/lessons';
  private readonly http = inject(HttpClient);

  getWeek(weekStart: string): Promise<MemberLesson[]> {
    return firstValueFrom(this.http.get<MemberLesson[]>(this.baseUrl, { params: { weekStart } }));
  }
}
