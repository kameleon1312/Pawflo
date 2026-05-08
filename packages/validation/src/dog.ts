import { z } from 'zod';

const ALLOWED_TRAITS = [
  'PLAYFUL', 'CALM', 'FRIENDLY', 'PROTECTIVE', 'ENERGETIC',
  'LAZY', 'CURIOUS', 'GENTLE', 'SHY', 'AFFECTIONATE', 'INDEPENDENT', 'SOCIAL', 'TRAINABLE',
] as const;

export const CreateDogSchema = z.object({
  name: z.string().min(1).max(50).trim(),
  breed: z.string().max(100).trim().nullable().optional(),
  birthDate: z.string().datetime().nullable().optional(),
  sex: z.enum(['MALE', 'FEMALE']),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE']),
  bio: z.string().max(500).trim().nullable().optional(),
  traits: z.array(z.enum(ALLOWED_TRAITS)).max(8),
  activityLevel: z.enum(['CALM', 'MODERATE', 'ACTIVE']).default('MODERATE'),
  weight: z.number().positive().max(150).nullable().optional(),
});

export const UpdateDogSchema = CreateDogSchema.partial();

export const WeightEntrySchema = z.object({
  weightKg: z.number().positive().max(150),
  date: z.string().datetime(),
});

export type CreateDogInput = z.infer<typeof CreateDogSchema>;
export type UpdateDogInput = z.infer<typeof UpdateDogSchema>;
export type WeightEntryInput = z.infer<typeof WeightEntrySchema>;
