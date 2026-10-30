export type HorseStatus = 'REPOS' | 'PRE' | 'DISPONIBLE' | 'CONVALESCENCE';

export type Location = 'CARRIERE' | 'PRE' | 'MANEGE' | 'BOX' | 'PADOCK';

export interface HorseRequest {
  name: string;
  breed: string;
  heightCm: number;
  weightKg: number;
  dailyHours: number;
  status: HorseStatus;
  location: Location;
  requiredLevel: number;
}

export interface Horse extends HorseRequest {
  id: number;
}
