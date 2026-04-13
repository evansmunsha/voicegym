import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieParts = [`vg_session=`, 'HttpOnly', 'Path=/', `Max-Age=0`, 'SameSite=Strict'];
  if (isProd) cookieParts.push('Secure');
  const res = NextResponse.json({ success: true });
  res.headers.append('Set-Cookie', cookieParts.join('; '));
  return res;
}
