import { createHmac } from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-session-secret';

export function createSessionToken(userId: string, maxAgeSec = 7 * 24 * 3600) {
  const expiry = Math.floor(Date.now() / 1000) + maxAgeSec;
  const payload = `${userId}:${expiry}`;
  const hmac = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  const token = `${payload}:${hmac}`;
  const b64 = Buffer.from(token, 'utf8').toString('base64');
  return { token: b64, maxAgeSec };
}

export function verifySessionToken(tokenB64: string): string | null {
  try {
    const token = Buffer.from(tokenB64, 'base64').toString('utf8');
    const parts = token.split(':');
    if (parts.length < 3) return null;
    const userId = parts[0];
    const expiry = parseInt(parts[1], 10);
    const hmac = parts.slice(2).join(':');
    const payload = `${userId}:${expiry}`;
    const expected = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
    const expBuf = Buffer.from(expected, 'hex');
    const hmacBuf = Buffer.from(hmac, 'hex');
    if (expBuf.length !== hmacBuf.length) return null;
    // timing-safe compare
    let equal = true;
    for (let i = 0; i < expBuf.length; i++) {
      if (expBuf[i] !== hmacBuf[i]) {
        equal = false;
        break;
      }
    }
    if (!equal) return null;
    if (Math.floor(Date.now() / 1000) > expiry) return null;
    return userId;
  } catch (e) {
    return null;
  }
}
