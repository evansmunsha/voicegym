import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import getPrismaClient from '../../../lib/prisma';
import { createSessionToken } from '@/lib/session-server';

export async function POST(req: NextRequest) {
  const { email, password, username } = await req.json();
  if (!email || !password || !username) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  if (typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }
  const prisma = getPrismaClient();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
  }
  const existingUserName = await prisma.user.findUnique({ where: { username } });
  if (existingUserName) {
    return NextResponse.json({ error: 'Username already in use' }, { status: 409 });
  }
  const hashed = await hash(password, 10);
  const user = await prisma.user.create({
    data: { email, username, password: hashed },
  });
  // Create a secure session cookie
  const { token, maxAgeSec } = createSessionToken(user.id);
  const res = NextResponse.json({ id: user.id, email: user.email, username: user.username });
  const cookieParts = [`vg_session=${token}`, 'HttpOnly', 'Path=/', `Max-Age=${maxAgeSec}`, 'SameSite=Strict'];
  if (process.env.NODE_ENV === 'production') cookieParts.push('Secure');
  res.headers.append('Set-Cookie', cookieParts.join('; '));
  return res;
}
