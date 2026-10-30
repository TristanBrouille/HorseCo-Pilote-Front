import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { WeeklySlot, WeeklySlotRequest } from './weeklySlotModel';

@Injectable({ providedIn: 'root' })
export class WeeklySlotsService {
  private readonly baseUrl = 'http://localhost:8080/weekly-slots';
  private readonly http = inject(HttpClient);

  getAll(): Promise<WeeklySlot[]> {
    return firstValueFrom(this.http.get<WeeklySlot[]>(this.baseUrl));
  }

  create(request: WeeklySlotRequest): Promise<WeeklySlot> {
    return firstValueFrom(this.http.post<WeeklySlot>(this.baseUrl, request));
  }

  update(id: number, request: WeeklySlotRequest): Promise<WeeklySlot> {
    return firstValueFrom(this.http.put<WeeklySlot>(`${this.baseUrl}/${id}`, request));
  }

  delete(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }
}
