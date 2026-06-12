// In-memory rate limiter (подходит для desktop-приложения с одним пользователем на ПК)

interface AttemptEntry {
  count: number;
  firstAttempt: number;
  blockedUntil: number;
}

const store = new Map<string, AttemptEntry>();

function getKey(prefix: string, identifier: string): string {
  return `${prefix}:${identifier}`;
}

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store) {
    // Удаляем только если блокировка истекла И была активна (blockedUntil > 0)
    if (entry.blockedUntil > 0 && entry.blockedUntil < now) {
      store.delete(key);
    }
  }
}

setInterval(cleanup, 60_000); // чистим каждую минуту

export function checkRateLimit(prefix: string, identifier: string, maxAttempts: number, windowMs: number, blockMs: number): { allowed: boolean; retryAfter?: number } {
  const key = getKey(prefix, identifier);
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
    // окно прошло, сбрасываем
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
  store.delete(getKey(prefix, identifier));
}
