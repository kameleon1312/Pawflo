import { NextRequest, NextResponse } from 'next/server';
import { WaitlistSchema } from '@pawflo/validation';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body: unknown = await req.json();
  const parsed = WaitlistSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Nieprawidłowe dane.', details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { email, city, acceptMarketing } = parsed.data;

  const existing = await prisma.waitlist.findUnique({ where: { email } });
  if (existing) {
    // Silent success — don't reveal if email already exists
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  await prisma.waitlist.create({ data: { email, city, acceptMarketing } });

  return NextResponse.json({ ok: true }, { status: 201 });
}
