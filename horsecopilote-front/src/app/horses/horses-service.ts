import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Horse, HorseRequest } from './horseModel';

@Injectable({ providedIn: 'root' })
export class HorsesService {
  private readonly baseUrl = 'http://localhost:8080/horses';
  private readonly http = inject(HttpClient);

  getAll(): Promise<Horse[]> {
    return firstValueFrom(this.http.get<Horse[]>(this.baseUrl));
  }

  create(request: HorseRequest): Promise<Horse> {
    return firstValueFrom(this.http.post<Horse>(this.baseUrl, request));
  }

  update(id: number, request: HorseRequest): Promise<Horse> {
    return firstValueFrom(this.http.put<Horse>(`${this.baseUrl}/${id}`, request));
  }

  delete(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }
}
