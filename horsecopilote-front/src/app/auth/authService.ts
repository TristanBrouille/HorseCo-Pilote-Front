import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LoginResponse, Me, UserLog } from './authModel';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080';

  private readonly user = signal<Me | null>(null);
  // Utilisateur connecté, rafraîchi par getMe() (appelé par les guards à chaque navigation).
  readonly currentUser = this.user.asReadonly();

  login(credentials: UserLog): Promise<LoginResponse> {
    return firstValueFrom(this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials));
  }

  async getMe(): Promise<Me> {
    const me = await firstValueFrom(this.http.get<Me>(`${this.baseUrl}/me`));
    this.user.set(me);
    return me;
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post<void>(`${this.baseUrl}/logout`, null));
    } finally {
      // Même si l'appel échoue, on oublie l'utilisateur côté front.
      this.user.set(null);
    }
  }
}
