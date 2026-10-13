import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Coach } from '../model/coach';

@Injectable({ providedIn: 'root' })
export class CoachesService {
  private readonly baseUrl = 'http://localhost:8080/api/coaches';
  private readonly http = inject(HttpClient);

  getAll(): Promise<Coach[]> {
    return firstValueFrom(this.http.get<Coach[]>(this.baseUrl));
  }
}
