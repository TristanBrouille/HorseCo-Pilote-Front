import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SlotMember, WeeklySlot, WeeklySlotRequest } from './weeklySlotModel';

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

  getMembers(id: number): Promise<SlotMember[]> {
    return firstValueFrom(this.http.get<SlotMember[]>(`${this.baseUrl}/${id}/members`));
  }

  getEligibleMembers(id: number): Promise<SlotMember[]> {
    return firstValueFrom(this.http.get<SlotMember[]>(`${this.baseUrl}/${id}/eligible-members`));
  }

  addMember(id: number, memberId: number): Promise<SlotMember[]> {
    return firstValueFrom(
      this.http.post<SlotMember[]>(`${this.baseUrl}/${id}/members/${memberId}`, null),
    );
  }

  removeMember(id: number, memberId: number): Promise<SlotMember[]> {
    return firstValueFrom(
      this.http.delete<SlotMember[]>(`${this.baseUrl}/${id}/members/${memberId}`),
    );
  }
}
