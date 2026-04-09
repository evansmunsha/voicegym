import { hash, compare } from 'bcryptjs';
import { NextRequest } from 'next/server';
import prisma from './prisma';

export async function hashPassword(password: string) {
  return hash(password, 10);
}

export async function verifyPassword(password: string, hashed: string) {
  return compare(password, hashed);
}

export async function requireAuth(req: NextRequest) {
  // Example: check for session or JWT (expand as needed)
  const user = req.cookies.get('user');
  if (!user) throw new Error('Not authenticated');
  return user;
}
