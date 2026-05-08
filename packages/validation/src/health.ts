import { z } from 'zod';

export const CreateVaccinationSchema = z.object({
  name:       z.string().min(1).max(100).trim(),
  date:       z.string().datetime(),
  validUntil: z.string().datetime().nullable().optional(),
  vetId:      z.string().max(200).trim().nullable().optional(),
});

export const CreateVetVisitSchema = z.object({
  date:  z.string().datetime(),
  notes: z.string().max(2000).trim().nullable().optional(),
  vetId: z.string().max(200).trim().nullable().optional(),
});

export const CreateWeightSchema = z.object({
  weightKg: z.number().positive().max(150),
  date:     z.string().datetime(),
});

export const CreateMedicationSchema = z.object({
  name:      z.string().min(1).max(100).trim(),
  startDate: z.string().datetime(),
  endDate:   z.string().datetime().nullable().optional(),
  dosage:    z.string().min(1).max(100).trim(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'AS_NEEDED']),
});

export const UpdateMedicationSchema = CreateMedicationSchema.partial();

export const CreateAllergySchema = z.object({
  name:     z.string().min(1).max(100).trim(),
  severity: z.enum(['MILD', 'MODERATE', 'SEVERE']),
  notes:    z.string().max(500).trim().nullable().optional(),
});

export type CreateVaccinationInput = z.infer<typeof CreateVaccinationSchema>;
export type CreateVetVisitInput    = z.infer<typeof CreateVetVisitSchema>;
export type CreateWeightInput      = z.infer<typeof CreateWeightSchema>;
export type CreateMedicationInput  = z.infer<typeof CreateMedicationSchema>;
export type CreateAllergyInput     = z.infer<typeof CreateAllergySchema>;
