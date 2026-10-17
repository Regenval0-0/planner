import jwt from 'jsonwebtoken';
import { JWT_SECRET, TOKEN_TTL } from '../config.js';
import { prisma } from '../prisma.js';

interface TokenPayload {
  userId: string;
  v: number;
}

export function signToken(user: { id: string; tokenVersion: number }): string {
  const payload: TokenPayload = { userId: user.id, v: user.tokenVersion };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

/**
 * Проверяет токен и что он не отозван (после смены пароля или удаления аккаунта
 * tokenVersion увеличивается, и старые токены на других устройствах перестают работать).
 * Возвращает userId или null.
 */
export async function verifyToken(token: string): Promise<string | null> {
  let decoded: Partial<TokenPayload>;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as Partial<TokenPayload>;
  } catch {
    return null;
  }
  if (!decoded.userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { tokenVersion: true },
  });
  if (!user) return null;
  if ((decoded.v ?? 0) !== user.tokenVersion) return null;
  return decoded.userId;
}
