import { describe, it, expect } from 'vitest';
import { CreateDogSchema, UpdateDogSchema, WeightEntrySchema } from '../dog';

const validDog = {
  name: 'Burek',
  sex: 'MALE' as const,
  size: 'MEDIUM' as const,
  traits: ['PLAYFUL', 'FRIENDLY'] as const,
};

describe('CreateDogSchema', () => {
  it('accepts minimal valid dog', () => {
    expect(CreateDogSchema.safeParse(validDog).success).toBe(true);
  });

  it('defaults activityLevel to MODERATE', () => {
    const result = CreateDogSchema.safeParse(validDog);
    expect(result.success && result.data.activityLevel).toBe('MODERATE');
  });

  it('trims name whitespace', () => {
    const result = CreateDogSchema.safeParse({ ...validDog, name: '  Rex  ' });
    expect(result.success && result.data.name).toBe('Rex');
  });

  it('rejects empty name', () => {
    expect(CreateDogSchema.safeParse({ ...validDog, name: '' }).success).toBe(false);
  });

  it('rejects name longer than 50 characters', () => {
    expect(CreateDogSchema.safeParse({ ...validDog, name: 'A'.repeat(51) }).success).toBe(false);
  });

  it('rejects invalid sex value', () => {
    expect(CreateDogSchema.safeParse({ ...validDog, sex: 'UNKNOWN' }).success).toBe(false);
  });

  it('rejects invalid size value', () => {
    expect(CreateDogSchema.safeParse({ ...validDog, size: 'HUGE' }).success).toBe(false);
  });

  it('rejects more than 8 traits', () => {
    const tooManyTraits = ['PLAYFUL', 'CALM', 'FRIENDLY', 'PROTECTIVE', 'ENERGETIC', 'LAZY', 'CURIOUS', 'GENTLE', 'SHY'];
    expect(CreateDogSchema.safeParse({ ...validDog, traits: tooManyTraits }).success).toBe(false);
  });

  it('rejects unknown trait', () => {
    expect(CreateDogSchema.safeParse({ ...validDog, traits: ['AGGRESSIVE'] }).success).toBe(false);
  });

  it('rejects negative weight', () => {
    expect(CreateDogSchema.safeParse({ ...validDog, weight: -1 }).success).toBe(false);
  });

  it('rejects weight over 150', () => {
    expect(CreateDogSchema.safeParse({ ...validDog, weight: 151 }).success).toBe(false);
  });

  it('accepts null weight', () => {
    expect(CreateDogSchema.safeParse({ ...validDog, weight: null }).success).toBe(true);
  });

  it('rejects bio longer than 500 characters', () => {
    expect(CreateDogSchema.safeParse({ ...validDog, bio: 'x'.repeat(501) }).success).toBe(false);
  });
});

describe('UpdateDogSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    expect(UpdateDogSchema.safeParse({}).success).toBe(true);
  });

  it('accepts partial update with only name', () => {
    expect(UpdateDogSchema.safeParse({ name: 'Max' }).success).toBe(true);
  });

  it('still validates name length on partial update', () => {
    expect(UpdateDogSchema.safeParse({ name: '' }).success).toBe(false);
  });
});

describe('WeightEntrySchema', () => {
  it('accepts valid weight entry', () => {
    expect(WeightEntrySchema.safeParse({
      weightKg: 12.5,
      date: new Date().toISOString(),
    }).success).toBe(true);
  });

  it('rejects zero weight', () => {
    expect(WeightEntrySchema.safeParse({ weightKg: 0, date: new Date().toISOString() }).success).toBe(false);
  });

  it('rejects invalid date format', () => {
    expect(WeightEntrySchema.safeParse({ weightKg: 10, date: '2024-01-01' }).success).toBe(false);
  });
});
