export type AllergySeverity = 'MILD' | 'MODERATE' | 'SEVERE';
export type MedicationFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'AS_NEEDED';

export interface Vaccination {
  id: string;
  dogId: string;
  name: string;
  date: string;
  validUntil: string | null;
  vetId: string | null;
  photoUrl: string | null;
  createdAt: string;
}

export interface VetVisit {
  id: string;
  dogId: string;
  date: string;
  notes: string | null;
  vetId: string | null;
  attachments: string[];
  createdAt: string;
}

export interface WeightEntry {
  id: string;
  dogId: string;
  date: string;
  weightKg: number;
  createdAt: string;
}

export interface Medication {
  id: string;
  dogId: string;
  name: string;
  startDate: string;
  endDate: string | null;
  dosage: string;
  frequency: MedicationFrequency;
  createdAt: string;
}

export interface Allergy {
  id: string;
  dogId: string;
  name: string;
  severity: AllergySeverity;
  notes: string | null;
  createdAt: string;
}

export interface PawPanelSummary {
  dogId: string;
  currentWeight: number | null;
  nextVaccination: Vaccination | null;
  activemedications: Medication[];
  recentVisit: VetVisit | null;
}
