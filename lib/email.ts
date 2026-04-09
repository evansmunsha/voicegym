export async function sendPasswordResetEmail(email: string, token: string) {
  // If no API key is configured, skip sending during build or local development.
  if (!process.env.RESEND_API_KEY) {
    // eslint-disable-next-line no-console
    console.warn('RESEND_API_KEY not set — skipping sendPasswordResetEmail for', email);
    return;
  }

  // Lazily import to avoid module initialization during build-time.
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}`;
  await resend.emails.send({
    from: process.env.RESEND_FROM || 'no-reply@voicegym.com',
    to: email,
    subject: 'Reset your VoiceGym password',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link will expire in 1 hour.</p>`
  });
}
