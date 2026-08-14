import crypto from 'crypto';

const SECRET_KEY = process.env.SIGNED_URL_SECRET || 'ednexus-private-cdn-secret-key-998877665544332211';

export interface SignedTokenPayload {
  userId: string;
  courseId: string;
  lessonId: string;
  rawVideoUrl: string;
  expiresAt: number;
}

/**
 * Generates a short-lived signed video token & temporary stream URL.
 * Does NOT expose permanent private storage URLs.
 */
export function generateSignedVideoToken(
  userId: string,
  courseId: string,
  lessonId: string,
  rawVideoUrl: string,
  expiresInMinutes: number = 30
): { streamUrl: string; token: string; expiresAt: string } {
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
  
  const payload: SignedTokenPayload = {
    userId,
    courseId,
    lessonId,
    rawVideoUrl,
    expiresAt,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(payloadBase64)
    .digest('hex');

  const token = `${payloadBase64}.${signature}`;
  const streamUrl = `/api/media/stream?token=${encodeURIComponent(token)}`;

  return {
    streamUrl,
    token,
    expiresAt: new Date(expiresAt).toISOString(),
  };
}

/**
 * Validates a signed video token string.
 */
export function verifySignedVideoToken(token: string): {
  valid: boolean;
  payload?: SignedTokenPayload;
  error?: string;
} {
  try {
    if (!token || !token.includes('.')) {
      return { valid: false, error: 'INVALID_TOKEN_FORMAT' };
    }

    const [payloadBase64, signature] = token.split('.');

    // Re-calculate expected HMAC signature
    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(payloadBase64)
      .digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature)) === false) {
      return { valid: false, error: 'INVALID_SIGNATURE' };
    }

    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf8');
    const payload: SignedTokenPayload = JSON.parse(payloadJson);

    if (Date.now() > payload.expiresAt) {
      return { valid: false, error: 'TOKEN_EXPIRED' };
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: 'VERIFICATION_FAILED' };
  }
}
