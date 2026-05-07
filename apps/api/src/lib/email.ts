import { logger } from './logger';

// TODO: replace stub with Resend SDK when RESEND_API_KEY is configured.
// import { Resend } from 'resend';
// const resend = new Resend(process.env['RESEND_API_KEY']);

export async function sendVerificationEmail(_to: string, _token: string): Promise<void> {
  // Never log the token — only log that the event happened.
  logger.info({ event: 'email.verification.sent' }, 'Verification email queued');
  // Uncomment when RESEND_API_KEY is configured:
  // const url = `${process.env['APP_URL']}/verify-email?token=${_token}`;
  // await resend.emails.send({ from: process.env['EMAIL_FROM']!, to: _to, subject: '...', html: url });
}

export async function sendPasswordResetEmail(_to: string, _token: string): Promise<void> {
  logger.info({ event: 'email.reset.sent' }, 'Password reset email queued');
  // const url = `${process.env['APP_URL']}/reset-password?token=${_token}`;
  // await resend.emails.send({ from: process.env['EMAIL_FROM']!, to: _to, subject: '...', html: url });
}
