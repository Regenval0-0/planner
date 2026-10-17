import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { emitToUser } from '../lib/realtime.js';

const router = Router();
router.use(authMiddleware);

const MAX_EVENTS_PER_USER = 20000;

const isoDate = z.string().datetime({ offset: true });

// Повторяющиеся события хранятся одной записью; конкретные даты повторов
// рассчитывает приложение (так они работают и без интернета).
const baseFields = {
  title: z.string().trim().max(200),
  description: z.string().max(2000).nullable(),
  startDate: isoDate,
  endDate: isoDate.nullable(),
  type: z.enum(['event', 'task', 'meeting', 'payment']),
  recurrence: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'yearly', 'custom']).nullable(),
  recurrenceEnd: isoDate.nullable(),
  recurrenceInterval: z.number().int().min(1).max(3650).nullable(),
  amount: z.number().min(0).max(1e12).nullable(),
  reminderMinutes: z.number().int().min(0).max(60 * 24 * 30).nullable(),
};

const createSchema = z.object({
  // Приложение само создаёт id (UUID), чтобы событие, созданное без интернета,
  // можно было редактировать и удалять до синхронизации.
  id: z.string().uuid().optional(),
  title: baseFields.title.default(''),
  description: baseFields.description.optional(),
  startDate: baseFields.startDate,
  endDate: baseFields.endDate.optional(),
  type: baseFields.type.default('event'),
  recurrence: baseFields.recurrence.optional(),
  recurrenceEnd: baseFields.recurrenceEnd.optional(),
  recurrenceInterval: baseFields.recurrenceInterval.optional(),
  amount: baseFields.amount.optional(),
  reminderMinutes: baseFields.reminderMinutes.optional(),
});

const updateSchema = z.object({
  title: baseFields.title.optional(),
  description: baseFields.description.optional(),
  startDate: baseFields.startDate.optional(),
  endDate: baseFields.endDate.optional(),
  type: baseFields.type.optional(),
  recurrence: baseFields.recurrence.optional(),
  recurrenceEnd: baseFields.recurrenceEnd.optional(),
  recurrenceInterval: baseFields.recurrenceInterval.optional(),
  amount: baseFields.amount.optional(),
  reminderMinutes: baseFields.reminderMinutes.optional(),
});

type EventInput = z.infer<typeof updateSchema>;

function toDate(v: string | null | undefined): Date | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;
  return new Date(v);
}

function toData(input: EventInput) {
  return {
    title: input.title,
    description: input.description === undefined ? undefined : input.description || null,
    startDate: toDate(input.startDate) ?? undefined,
    endDate: toDate(input.endDate),
    type: input.type,
    recurrence: input.recurrence,
    recurrenceEnd: toDate(input.recurrenceEnd),
    recurrenceInterval: input.recurrenceInterval,
    amount: input.amount,
    reminderMinutes: input.reminderMinutes,
  };
}

/** Проверки, которые зависят от нескольких полей сразу. Возвращает текст ошибки или null. */
function validateMerged(e: {
  startDate: Date;
  endDate: Date | null;
  recurrence: string | null;
  recurrenceEnd: Date | null;
  recurrenceInterval: number | null;
}): string | null {
  if (e.endDate && e.endDate.getTime() < e.startDate.getTime()) {
    return 'Окончание не может быть раньше начала';
  }
  if (e.recurrence === 'custom' && !e.recurrenceInterval) {
    return 'Укажите, через сколько дней повторять';
  }
  if (e.recurrence && e.recurrenceEnd && e.recurrenceEnd.getTime() < e.startDate.getTime()) {
    return 'Дата окончания повторов раньше даты начала';
  }
  return null;
}

function badRequest(error: z.ZodError) {
  const issue = error.issues[0];
  return { error: issue ? `Неверные данные: ${issue.path.join('.') || 'запрос'} — ${issue.message}` : 'Неверные данные' };
}

// Все события пользователя (без раскрытия повторов).
router.get(
  '/',
  asyncHandler<AuthRequest>(async (req, res) => {
    const events = await prisma.event.findMany({
      where: { userId: req.userId! },
      orderBy: { startDate: 'asc' },
    });
    res.json(events);
  }),
);

router.post(
  '/',
  asyncHandler<AuthRequest>(async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(badRequest(parsed.error));
      return;
    }
    const userId = req.userId!;
    const { id, ...fields } = parsed.data;

    // Повторная отправка того же события (например, после обрыва связи) — не создаём дубликат.
    if (id) {
      const existing = await prisma.event.findUnique({ where: { id } });
      if (existing) {
        if (existing.userId !== userId) {
          res.status(409).json({ error: 'Конфликт идентификатора события' });
          return;
        }
        res.status(200).json(existing);
        return;
      }
    }

    const data = toData(fields);
    const merged = {
      startDate: data.startDate!,
      endDate: data.endDate ?? null,
      recurrence: data.recurrence ?? null,
      recurrenceEnd: data.recurrenceEnd ?? null,
      recurrenceInterval: data.recurrenceInterval ?? null,
    };
    const problem = validateMerged(merged);
    if (problem) {
      res.status(400).json({ error: problem });
      return;
    }

    const count = await prisma.event.count({ where: { userId } });
    if (count >= MAX_EVENTS_PER_USER) {
      res.status(400).json({ error: 'Достигнут предел количества событий' });
      return;
    }

    try {
      const event = await prisma.event.create({
        data: {
          ...(id ? { id } : {}),
          userId,
          title: data.title ?? '',
          description: data.description ?? null,
          startDate: merged.startDate,
          endDate: merged.endDate,
          type: data.type ?? 'event',
          recurrence: merged.recurrence,
          recurrenceEnd: merged.recurrenceEnd,
          recurrenceInterval: merged.recurrence === 'custom' ? merged.recurrenceInterval : null,
          amount: data.amount ?? null,
          reminderMinutes: data.reminderMinutes ?? null,
        },
      });
      emitToUser(userId, 'event:created', event);
      res.status(201).json(event);
    } catch (err) {
      // Два одновременных запроса с одним id.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002' && id) {
        const existing = await prisma.event.findUnique({ where: { id } });
        if (existing && existing.userId === userId) {
          res.status(200).json(existing);
          return;
        }
      }
      throw err;
    }
  }),
);

router.put(
  '/:id',
  asyncHandler<AuthRequest>(async (req, res) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(badRequest(parsed.error));
      return;
    }
    const userId = req.userId!;
    const existing = await prisma.event.findFirst({ where: { id: req.params.id, userId } });
    if (!existing) {
      res.status(404).json({ error: 'Событие не найдено' });
      return;
    }

    const data = toData(parsed.data);
    const merged = {
      startDate: data.startDate ?? existing.startDate,
      endDate: data.endDate === undefined ? existing.endDate : data.endDate,
      recurrence: data.recurrence === undefined ? existing.recurrence : data.recurrence,
      recurrenceEnd: data.recurrenceEnd === undefined ? existing.recurrenceEnd : data.recurrenceEnd,
      recurrenceInterval:
        data.recurrenceInterval === undefined ? existing.recurrenceInterval : data.recurrenceInterval,
    };
    const problem = validateMerged(merged);
    if (problem) {
      res.status(400).json({ error: problem });
      return;
    }

    const updated = await prisma.event.update({
      where: { id: existing.id },
      data: {
        ...data,
        recurrenceInterval: merged.recurrence === 'custom' ? merged.recurrenceInterval : null,
        recurrenceEnd: merged.recurrence ? merged.recurrenceEnd : null,
      },
    });
    emitToUser(userId, 'event:updated', updated);
    res.json(updated);
  }),
);

router.delete(
  '/:id',
  asyncHandler<AuthRequest>(async (req, res) => {
    const userId = req.userId!;
    const result = await prisma.event.deleteMany({ where: { id: req.params.id, userId } });
    if (result.count > 0) {
      emitToUser(userId, 'event:deleted', { id: req.params.id });
    }
    // Удаление уже удалённого события — не ошибка (повторная отправка из очереди).
    res.status(204).send();
  }),
);

export default router;
