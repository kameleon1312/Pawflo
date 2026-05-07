import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email().toLowerCase().trim().max(255),
  password: z
    .string()
    .min(12, 'Minimum 12 znaków')
    .max(128)
    .regex(/[A-Z]/, 'Musi zawierać wielką literę')
    .regex(/[0-9]/, 'Musi zawierać cyfrę')
    .regex(/[^A-Za-z0-9]/, 'Musi zawierać znak specjalny'),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Musisz zaakceptować regulamin' }),
  }),
  acceptPrivacy: z.literal(true, {
    errorMap: () => ({ message: 'Musisz zaakceptować politykę prywatności' }),
  }),
});

export const LoginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(12, 'Minimum 12 znaków')
      .max(128)
      .regex(/[A-Z]/, 'Musi zawierać wielką literę')
      .regex(/[0-9]/, 'Musi zawierać cyfrę')
      .regex(/[^A-Za-z0-9]/, 'Musi zawierać znak specjalny'),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Hasła muszą być identyczne',
    path: ['passwordConfirm'],
  });

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
