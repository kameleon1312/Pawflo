export type DogSex = 'MALE' | 'FEMALE';
export type DogSize = 'SMALL' | 'MEDIUM' | 'LARGE';
export type ActivityLevel = 'CALM' | 'MODERATE' | 'ACTIVE';

export interface Photo {
  id: string;
  url: string;
  order: number;
}

export interface Dog {
  id: string;
  ownerId: string;
  name: string;
  breed: string | null;
  birthDate: string | null;
  sex: DogSex;
  size: DogSize;
  bio: string | null;
  traits: string[];
  activityLevel: ActivityLevel;
  photos: Photo[];
  weight: number | null;
  createdAt: string;
  updatedAt: string;
}

// Lightweight version used in lists and profile previews
export type DogSummary = Pick<
  Dog,
  'id' | 'name' | 'breed' | 'sex' | 'size' | 'activityLevel' | 'photos'
>;

// Full dog card returned by GET /api/swipes/candidates
export interface CandidateDog {
  id: string;
  name: string;
  breed: string | null;
  birthDate: string | null;
  sex: DogSex;
  size: DogSize;
  activityLevel: ActivityLevel;
  traits: string[];
  bio: string | null;
  photos: Photo[];
  owner: { locationCity: string | null };
}
