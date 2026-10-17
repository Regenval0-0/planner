import type { Request } from 'express';

// Ограничение частоты запросов в памяти процесса (одного экземпляра сервера достаточно).

interface AttemptEntry {
  count: number;
  firstAttempt: number;
  blockedUntil: number;
}

const store = new Map<string, AttemptEntry>();

const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    const windowOver = now - entry.firstAttempt > 24 * 60 * 60 * 1000;
    if ((entry.blockedUntil > 0 && entry.blockedUntil < now) || windowOver) {
      store.delete(key);
    }
  }
}, 60_000);
cleanupTimer.unref();

export function checkRateLimit(
  prefix: string,
  identifier: string,
  maxAttempts: number,
  windowMs: number,
  blockMs: number,
): { allowed: boolean; retryAfter?: number } {
  // Только для автотестов: там много регистраций с одного адреса.
  if (process.env.DISABLE_RATE_LIMIT === '1') return { allowed: true };
  const key = `${prefix}:${identifier}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry) {
    store.set(key, { count: 1, firstAttempt: now, blockedUntil: 0 });
    return { allowed: true };
  }
  if (entry.blockedUntil > now) {
    return { allowed: false, retryAfter: Math.ceil((entry.blockedUntil - now) / 1000) };
  }
  if (now - entry.firstAttempt > windowMs) {
    store.set(key, { count: 1, firstAttempt: now, blockedUntil: 0 });
    return { allowed: true };
  }
  entry.count++;
  if (entry.count > maxAttempts) {
    entry.blockedUntil = now + blockMs;
    return { allowed: false, retryAfter: Math.ceil(blockMs / 1000) };
  }
  return { allowed: true };
}

export function resetAttempts(prefix: string, identifier: string) {
  store.delete(`${prefix}:${identifier}`);
}

/** IP клиента. За прокси (Render, Caddy) берётся из X-Forwarded-For через app.set('trust proxy'). */
export function clientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

export function retryMessage(seconds?: number): string {
  const s = seconds ?? 60;
  const minutes = Math.ceil(s / 60);
  return minutes > 1
    ? `Слишком много попыток. Попробуйте через ${minutes} мин.`
    : `Слишком много попыток. Попробуйте через ${s} сек.`;
}
