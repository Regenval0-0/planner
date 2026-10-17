import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';

export function createApp() {
  const app = express();

  // Сервер стоит за прокси (Render, Caddy) — берём настоящий IP клиента из X-Forwarded-For.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // Вход — по токену в заголовке Authorization (без cookie), поэтому запросы
  // разрешены с любого источника: приложение Android (https://localhost),
  // программа для ПК (app://planner), веб-версия.
  app.use(cors({ origin: true, maxAge: 86400 }));
  app.use(express.json({ limit: '200kb' }));

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
  });

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'planner', time: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/events', eventRoutes);

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Не найдено' });
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const e = err as { type?: string; status?: number };
    if (e?.type === 'entity.parse.failed') {
      res.status(400).json({ error: 'Некорректный JSON' });
      return;
    }
    if (e?.type === 'entity.too.large') {
      res.status(413).json({ error: 'Слишком большой запрос' });
      return;
    }
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  });

  return app;
}
