import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import getPrismaClient from '../../../lib/prisma';
import { createSessionToken } from '@/lib/session-server';

// Simple in-memory rate limiting per email (best-effort; not durable across instances)
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const loginAttempts = new Map<string, { count: number; first: number }>();

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  // Rate limiting
  const now = Date.now();
  const attempt = loginAttempts.get(email) || { count: 0, first: now };
  if (now - attempt.first > LOGIN_WINDOW_MS) {
    attempt.count = 0;
    attempt.first = now;
  }
  if (attempt.count >= LOGIN_MAX_ATTEMPTS) {
    return NextResponse.json({ error: 'Too many login attempts. Try later.' }, { status: 429 });
  }
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    attempt.count += 1;
    loginAttempts.set(email, attempt);
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  const valid = await compare(password, user.password);
  if (!valid) {
    attempt.count += 1;
    loginAttempts.set(email, attempt);
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  // Successful login — clear attempts and set secure HttpOnly session cookie
  loginAttempts.delete(email);
  const { token, maxAgeSec } = createSessionToken(user.id);
  const res = NextResponse.json({ id: user.id, email: user.email, username: user.username });
  const cookieParts = [`vg_session=${token}`, 'HttpOnly', 'Path=/', `Max-Age=${maxAgeSec}`, 'SameSite=Strict'];
  if (process.env.NODE_ENV === 'production') cookieParts.push('Secure');
  res.headers.append('Set-Cookie', cookieParts.join('; '));
  return res;
}
