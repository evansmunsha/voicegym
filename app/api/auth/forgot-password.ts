import { NextRequest, NextResponse } from 'next/server';
import getPrismaClient from '../../../lib/prisma';
import { randomBytes, createHash } from 'crypto';
import { sendPasswordResetEmail } from '../../../lib/email';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { email } });
  // Always respond with success to avoid user enumeration
  const token = randomBytes(32).toString('hex');
  const hashedToken = createHash('sha256').update(token).digest('hex');
  if (user) {
    await prisma.user.update({
      where: { email },
      data: { resetToken: hashedToken, resetTokenExpiry: new Date(Date.now() + 1000 * 60 * 60) },
    });
    await sendPasswordResetEmail(email, token);
  }
  return NextResponse.json({ message: 'If an account with that email exists, a reset link has been sent.' });
}
