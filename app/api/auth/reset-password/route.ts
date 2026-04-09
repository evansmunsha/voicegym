import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import getPrismaClient from '../../../../lib/prisma';

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const prisma = getPrismaClient();
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });
  if (!user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }
  const hashed = await hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, resetToken: null, resetTokenExpiry: null },
  });
  return NextResponse.json({ message: 'Password reset successful' });
}
