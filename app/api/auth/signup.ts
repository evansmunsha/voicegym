import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import getPrismaClient from '../../../lib/prisma';

export async function POST(req: NextRequest) {
  const { email, password, username } = await req.json();
  if (!email || !password || !username) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const prisma = getPrismaClient();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
  }
  const hashed = await hash(password, 10);
  const user = await prisma.user.create({
    data: { email, username, password: hashed },
  });
  // Optionally create session here
  return NextResponse.json({ id: user.id, email: user.email, username: user.username });
}
