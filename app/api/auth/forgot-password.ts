import { NextRequest, NextResponse } from 'next/server';
import getPrismaClient from '../../../lib/prisma';
import { randomBytes } from 'crypto';
import { sendPasswordResetEmail } from '../../../lib/email';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  const token = randomBytes(32).toString('hex');
  await prisma.user.update({
    where: { email },
    data: { resetToken: token, resetTokenExpiry: new Date(Date.now() + 1000 * 60 * 60) },
  });
  await sendPasswordResetEmail(email, token);
  return NextResponse.json({ message: 'Password reset email sent' });
}
