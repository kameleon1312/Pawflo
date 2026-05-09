export type Plan = 'FREE' | 'PLUS' | 'PRO';

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  plan: Plan;
  planExpiresAt: string | null;
  locationCity: string | null;
  locationConsent: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

// Returned by auth endpoints — never includes passwordHash
export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  plan: Plan;
}

export interface UserProfile extends AuthUser {
  dogs: import('./Dog').DogSummary[];
}
