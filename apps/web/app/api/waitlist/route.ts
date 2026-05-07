import { NextRequest, NextResponse } from 'next/server';
import { WaitlistSchema } from '@pawflo/validation';

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

  return NextResponse.json({ ok: true }, { status: 201 });
}
