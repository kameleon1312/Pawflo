import { NextRequest, NextResponse } from 'next/server';
import { WaitlistSchema } from '@pawflow/validation';

export async function POST(req: NextRequest) {
  const body: unknown = await req.json();
  const parsed = WaitlistSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Nieprawidłowe dane.', details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  // TODO: save to DB (Prisma) and send confirmation email (Resend)
  // For now, log to server console (email is redacted in prod via Pino)
  console.log('[waitlist] new signup:', parsed.data.email);

  return NextResponse.json({ ok: true }, { status: 201 });
}
