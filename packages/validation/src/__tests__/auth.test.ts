import { describe, it, expect } from 'vitest';
import {
  RegisterSchema,
  LoginSchema,
  ResetPasswordSchema,
  ForgotPasswordSchema,
} from '../auth';

describe('RegisterSchema', () => {
  const valid = {
    email: 'Test@Example.COM',
    password: 'Password1!Strong',
    acceptTerms: true as const,
    acceptPrivacy: true as const,
  };

  it('accepts valid registration data', () => {
    expect(RegisterSchema.safeParse(valid).success).toBe(true);
  });

  it('lowercases and trims email', () => {
    const result = RegisterSchema.safeParse(valid);
    expect(result.success && result.data.email).toBe('test@example.com');
  });

  it('rejects invalid email', () => {
    expect(RegisterSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
  });

  it('rejects password shorter than 12 characters', () => {
    expect(RegisterSchema.safeParse({ ...valid, password: 'Short1!' }).success).toBe(false);
  });

  it('rejects password without uppercase letter', () => {
    expect(RegisterSchema.safeParse({ ...valid, password: 'password1!long' }).success).toBe(false);
  });

  it('rejects password without digit', () => {
    expect(RegisterSchema.safeParse({ ...valid, password: 'PasswordLong!' }).success).toBe(false);
  });

  it('rejects password without special character', () => {
    expect(RegisterSchema.safeParse({ ...valid, password: 'Password1Long' }).success).toBe(false);
  });

  it('rejects when acceptTerms is false', () => {
    expect(RegisterSchema.safeParse({ ...valid, acceptTerms: false }).success).toBe(false);
  });

  it('rejects when acceptPrivacy is missing', () => {
    const { acceptPrivacy: _, ...noPrivacy } = valid;
    expect(RegisterSchema.safeParse(noPrivacy).success).toBe(false);
  });
});

describe('LoginSchema', () => {
  it('accepts valid login', () => {
    expect(LoginSchema.safeParse({ email: 'user@test.pl', password: 'any' }).success).toBe(true);
  });

  it('lowercases email', () => {
    const result = LoginSchema.safeParse({ email: 'USER@TEST.PL', password: 'x' });
    expect(result.success && result.data.email).toBe('user@test.pl');
  });

  it('rejects empty password', () => {
    expect(LoginSchema.safeParse({ email: 'user@test.pl', password: '' }).success).toBe(false);
  });
});

describe('ResetPasswordSchema', () => {
  const valid = {
    token: 'abc123token',
    password: 'NewPassword1!',
    passwordConfirm: 'NewPassword1!',
  };

  it('accepts matching passwords', () => {
    expect(ResetPasswordSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects when passwords do not match', () => {
    const result = ResetPasswordSchema.safeParse({ ...valid, passwordConfirm: 'Different1!' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors['passwordConfirm']).toBeDefined();
    }
  });

  it('rejects empty token', () => {
    expect(ResetPasswordSchema.safeParse({ ...valid, token: '' }).success).toBe(false);
  });
});

describe('ForgotPasswordSchema', () => {
  it('accepts valid email', () => {
    expect(ForgotPasswordSchema.safeParse({ email: 'user@example.pl' }).success).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(ForgotPasswordSchema.safeParse({ email: 'notanemail' }).success).toBe(false);
  });
});
