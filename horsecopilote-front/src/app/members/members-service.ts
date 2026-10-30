import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Member, MemberRequest } from './memberModel';

@Injectable({ providedIn: 'root' })
export class MembersService {
  private readonly baseUrl = 'http://localhost:8080/members';
  private readonly http = inject(HttpClient);

  getAll(): Promise<Member[]> {
    return firstValueFrom(this.http.get<Member[]>(this.baseUrl));
  }

  create(request: MemberRequest): Promise<Member> {
    return firstValueFrom(this.http.post<Member>(this.baseUrl, request));
  }
}
