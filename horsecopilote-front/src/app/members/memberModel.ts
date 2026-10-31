export interface Member {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  galopLevel: number;
  heightCm: number;
  weightKg: number;
}

export interface MemberRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  galopLevel: number;
  heightCm: number;
  weightKg: number;
}
