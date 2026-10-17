import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/tokens.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Требуется вход' });
    return;
  }
  const token = authHeader.slice(7);
  verifyToken(token)
    .then((userId) => {
      if (!userId) {
        res.status(401).json({ error: 'Сессия истекла, войдите снова' });
        return;
      }
      req.userId = userId;
      next();
    })
    .catch(next);
}
