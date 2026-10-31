export type Role = 'MEMBRE' | 'COACH' | 'ADMIN';

export interface UserLog {
  email?: string;
  password?: string;
}

// POST /login (back : security/presentation/Me)
export interface LoginResponse {
  email: string;
  roles: string[];
}

// GET /me (back : security/presentation/UserExpose)
export interface Me {
  firstname: string;
  lastname: string;
  email: string;
  role: Role;
}
