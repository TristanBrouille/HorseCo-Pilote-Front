import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Me, UserLog } from './authModel';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080';

  login(credentials: UserLog): Promise<Me> {
    return firstValueFrom(this.http.post<Me>(`${this.baseUrl}/login`, credentials));
  }

  getMe(): Promise<Me> {
    return firstValueFrom(this.http.get<Me>(`${this.baseUrl}/me`));
  }
}
