import { describe, it, expect } from 'vitest';
import {
  CreateVaccinationSchema,
  CreateVetVisitSchema,
  CreateWeightSchema,
  CreateMedicationSchema,
  UpdateMedicationSchema,
  CreateAllergySchema,
} from '../health';

const NOW = new Date().toISOString();
const FUTURE = new Date(Date.now() + 86_400_000).toISOString();

// ── Vaccination ──────────────────────────────────────────────────────────────

describe('CreateVaccinationSchema', () => {
  it('accepts valid input', () => {
    expect(CreateVaccinationSchema.safeParse({ name: 'Wścieklizna', date: NOW, validUntil: FUTURE }).success).toBe(true);
  });

  it('accepts without optional fields', () => {
    expect(CreateVaccinationSchema.safeParse({ name: 'Parvo', date: NOW }).success).toBe(true);
  });

  it('rejects empty name', () => {
    expect(CreateVaccinationSchema.safeParse({ name: '', date: NOW }).success).toBe(false);
  });

  it('rejects name longer than 100 chars', () => {
    expect(CreateVaccinationSchema.safeParse({ name: 'x'.repeat(101), date: NOW }).success).toBe(false);
  });

  it('rejects invalid date format', () => {
    expect(CreateVaccinationSchema.safeParse({ name: 'X', date: '2024-13-01' }).success).toBe(false);
  });

  it('accepts null validUntil', () => {
    expect(CreateVaccinationSchema.safeParse({ name: 'X', date: NOW, validUntil: null }).success).toBe(true);
  });
});

// ── Vet Visit ────────────────────────────────────────────────────────────────

describe('CreateVetVisitSchema', () => {
  it('accepts valid input with notes', () => {
    expect(CreateVetVisitSchema.safeParse({ date: NOW, notes: 'Kontrola' }).success).toBe(true);
  });

  it('accepts without optional fields', () => {
    expect(CreateVetVisitSchema.safeParse({ date: NOW }).success).toBe(true);
  });

  it('rejects notes longer than 2000 chars', () => {
    expect(CreateVetVisitSchema.safeParse({ date: NOW, notes: 'x'.repeat(2001) }).success).toBe(false);
  });

  it('rejects missing date', () => {
    expect(CreateVetVisitSchema.safeParse({ notes: 'test' }).success).toBe(false);
  });
});

// ── Weight ───────────────────────────────────────────────────────────────────

describe('CreateWeightSchema', () => {
  it('accepts a valid weight and date', () => {
    expect(CreateWeightSchema.safeParse({ weightKg: 12.5, date: NOW }).success).toBe(true);
  });

  it('rejects zero weight', () => {
    expect(CreateWeightSchema.safeParse({ weightKg: 0, date: NOW }).success).toBe(false);
  });

  it('rejects negative weight', () => {
    expect(CreateWeightSchema.safeParse({ weightKg: -5, date: NOW }).success).toBe(false);
  });

  it('rejects weight above 150', () => {
    expect(CreateWeightSchema.safeParse({ weightKg: 151, date: NOW }).success).toBe(false);
  });

  it('rejects missing date', () => {
    expect(CreateWeightSchema.safeParse({ weightKg: 10 }).success).toBe(false);
  });
});

// ── Medication ───────────────────────────────────────────────────────────────

describe('CreateMedicationSchema', () => {
  const base = { name: 'Apoquel', startDate: NOW, dosage: '1 tabletka', frequency: 'DAILY' as const };

  it('accepts valid input', () => {
    expect(CreateMedicationSchema.safeParse(base).success).toBe(true);
  });

  it('accepts with optional endDate', () => {
    expect(CreateMedicationSchema.safeParse({ ...base, endDate: FUTURE }).success).toBe(true);
  });

  it('rejects invalid frequency', () => {
    expect(CreateMedicationSchema.safeParse({ ...base, frequency: 'YEARLY' }).success).toBe(false);
  });

  it('accepts all valid frequencies', () => {
    for (const freq of ['DAILY', 'WEEKLY', 'MONTHLY', 'AS_NEEDED'] as const) {
      expect(CreateMedicationSchema.safeParse({ ...base, frequency: freq }).success).toBe(true);
    }
  });

  it('rejects empty name', () => {
    expect(CreateMedicationSchema.safeParse({ ...base, name: '' }).success).toBe(false);
  });
});

describe('UpdateMedicationSchema (partial)', () => {
  it('accepts empty object (all fields optional)', () => {
    expect(UpdateMedicationSchema.safeParse({}).success).toBe(true);
  });

  it('accepts partial update', () => {
    expect(UpdateMedicationSchema.safeParse({ dosage: '2 tabletki' }).success).toBe(true);
  });

  it('still rejects invalid values', () => {
    expect(UpdateMedicationSchema.safeParse({ frequency: 'NEVER' }).success).toBe(false);
  });
});

// ── Allergy ──────────────────────────────────────────────────────────────────

describe('CreateAllergySchema', () => {
  it('accepts valid input', () => {
    expect(CreateAllergySchema.safeParse({ name: 'Kurczak', severity: 'MILD' }).success).toBe(true);
  });

  it('accepts with optional notes', () => {
    expect(CreateAllergySchema.safeParse({ name: 'Kurczak', severity: 'SEVERE', notes: 'Wysypka' }).success).toBe(true);
  });

  it('rejects invalid severity', () => {
    expect(CreateAllergySchema.safeParse({ name: 'X', severity: 'EXTREME' }).success).toBe(false);
  });

  it('accepts all valid severities', () => {
    for (const severity of ['MILD', 'MODERATE', 'SEVERE'] as const) {
      expect(CreateAllergySchema.safeParse({ name: 'X', severity }).success).toBe(true);
    }
  });

  it('rejects empty name', () => {
    expect(CreateAllergySchema.safeParse({ name: '', severity: 'MILD' }).success).toBe(false);
  });

  it('rejects notes longer than 500 chars', () => {
    expect(CreateAllergySchema.safeParse({ name: 'X', severity: 'MILD', notes: 'x'.repeat(501) }).success).toBe(false);
  });
});
