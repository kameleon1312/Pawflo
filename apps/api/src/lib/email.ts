import { logger } from './logger';

// TODO: replace stub with Resend SDK when RESEND_API_KEY is configured.
// import { Resend } from 'resend';
// const resend = new Resend(process.env['RESEND_API_KEY']);

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const url = `${process.env['APP_URL'] ?? 'http://localhost:3000'}/verify-email?token=${token}`;
  logger.info({ event: 'email.verification.sent', url }, 'Verification email queued');
  // await resend.emails.send({ from: process.env['EMAIL_FROM']!, to, subject: '...', html: '...' });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const url = `${process.env['APP_URL'] ?? 'http://localhost:3000'}/reset-password?token=${token}`;
  logger.info({ event: 'email.reset.sent', url }, 'Password reset email queued');
}
