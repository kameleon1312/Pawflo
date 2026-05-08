import { Resend } from 'resend';
import { logger } from './logger';

const resend = new Resend(process.env['RESEND_API_KEY']);

const FROM = process.env['EMAIL_FROM'] ?? 'PawFlo <noreply@pawflo.pl>';
const APP_URL = process.env['APP_URL'] ?? 'https://pawflo.pl';

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const url = `${APP_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Potwierdź swój adres email — PawFlo',
    html: `
      <h2>Witaj w PawFlo!</h2>
      <p>Kliknij poniższy link, aby potwierdzić swój adres email:</p>
      <a href="${url}" style="display:inline-block;padding:12px 24px;background:#F08A8A;color:#fff;border-radius:9999px;text-decoration:none;font-weight:600;">
        Potwierdź email
      </a>
      <p style="color:#888;font-size:12px;margin-top:24px;">Link ważny przez 24 godziny. Jeśli nie rejestrowałeś się w PawFlo, zignoruj tę wiadomość.</p>
    `,
  });

  // Never log the token — only log that the event happened.
  logger.info({ event: 'email.verification.sent', to }, 'Verification email sent');
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const url = `${APP_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Resetowanie hasła — PawFlo',
    html: `
      <h2>Resetowanie hasła</h2>
      <p>Kliknij poniższy link, aby ustawić nowe hasło:</p>
      <a href="${url}" style="display:inline-block;padding:12px 24px;background:#F08A8A;color:#fff;border-radius:9999px;text-decoration:none;font-weight:600;">
        Resetuj hasło
      </a>
      <p style="color:#888;font-size:12px;margin-top:24px;">Link ważny przez 1 godzinę. Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość.</p>
    `,
  });

  logger.info({ event: 'email.reset.sent', to }, 'Password reset email sent');
}
