import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { io } from '../server.js';

const router = Router();

const eventSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  type: z.enum(['event', 'task', 'meeting', 'payment']).default('event'),
  recurrence: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'yearly', 'custom']).optional(),
  recurrenceEnd: z.string().datetime().optional(),
  recurrenceInterval: z.number().int().min(1).optional(),
  amount: z.number().optional(),
  reminderMinutes: z.number().int().min(0).optional(),
});

const updateSchema = eventSchema.partial();

function addRecurrence(date: Date, recurrence: string, interval?: number): Date {
  const d = new Date(date);
  switch (recurrence) {
    case 'daily': d.setDate(d.getDate() + 1); break;
    case 'weekly': d.setDate(d.getDate() + 7); break;
    case 'biweekly': d.setDate(d.getDate() + 14); break;
    case 'monthly': d.setMonth(d.getMonth() + 1); break;
    case 'yearly': d.setFullYear(d.getFullYear() + 1); break;
    case 'custom':
      if (interval && interval > 0) {
        d.setDate(d.getDate() + interval);
      }
      break;
  }
  return d;
}

function generateOccurrences(event: any, monthStart: Date, monthEnd: Date): any[] {
  if (!event.recurrence) return [];

  const occurrences: any[] = [];
  const originalStart = new Date(event.startDate);
  const originalEnd = event.endDate ? new Date(event.endDate) : null;
  const duration = originalEnd ? originalEnd.getTime() - originalStart.getTime() : 0;

  const recurrenceEnd = event.recurrenceEnd
    ? new Date(event.recurrenceEnd)
    : new Date(originalStart.getFullYear() + 5, originalStart.getMonth(), originalStart.getDate());

  let current = new Date(originalStart);
  const interval = event.recurrence === 'custom' ? event.recurrenceInterval : undefined;

  let safety = 0;
  while (current < monthStart && current <= recurrenceEnd && safety < 1000) {
    current = addRecurrence(current, event.recurrence, interval);
    safety++;
  }

  safety = 0;
  while (current <= monthEnd && current <= recurrenceEnd && safety < 1000) {
    const newStart = new Date(current);
    const newEnd = originalEnd ? new Date(newStart.getTime() + duration) : null;

    occurrences.push({
      ...event,
      id: `rec_${event.id}_${newStart.toISOString().split('T')[0]}`,
      startDate: newStart.toISOString(),
      endDate: newEnd?.toISOString() || null,
      isRecurrenceInstance: true,
      originId: event.id,
    });

    current = addRecurrence(current, event.recurrence, interval);
    safety++;
  }

  return occurrences;
}

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const { month, year } = req.query;
  const userId = req.userId!;

  const where: Prisma.EventWhereInput = { userId };

  if (month && year) {
    const m = parseInt(month as string, 10);
    const y = parseInt(year as string, 10);
    if (isNaN(m) || isNaN(y) || m < 1 || m > 12 || y < 1970) {
      res.status(400).json({ error: 'Invalid month or year' });
      return;
    }
    const monthStart = new Date(y, m - 1, 1);
    const monthEnd = new Date(y, m, 0, 23, 59, 59, 999);

    where.OR = [
      {
        recurrence: null,
        endDate: null,
        startDate: { gte: monthStart, lte: monthEnd },
      },
      {
        recurrence: null,
        endDate: { not: null },
        AND: [
          { startDate: { lte: monthEnd } },
          { endDate: { gte: monthStart } },
        ],
      },
      {
        recurrence: { not: null },
      },
    ];
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: { startDate: 'asc' },
  });

  if (month && year) {
    const m = parseInt(month as string, 10);
    const y = parseInt(year as string, 10);
    if (isNaN(m) || isNaN(y) || m < 1 || m > 12 || y < 1970) {
      res.status(400).json({ error: 'Invalid month or year' });
      return;
    }
    const monthStart = new Date(y, m - 1, 1);
    const monthEnd = new Date(y, m, 0, 23, 59, 59, 999);

    const result: Array<Prisma.EventGetPayload<{}> & { isRecurrenceInstance?: boolean; originId?: string }> = [];
    for (const event of events) {
      if (event.recurrence) {
        result.push(...generateOccurrences(event, monthStart, monthEnd));
      } else {
        result.push(event);
      }
    }
    res.json(result);
    return;
  }

  res.json(events);
});

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid data', details: parsed.error.format() });
    return;
  }

  const event = await prisma.event.create({
    data: { ...parsed.data, title: parsed.data.title || '', userId: req.userId! },
  });

  io.to(`user_${req.userId}`).emit('event:created', event);
  res.status(201).json(event);
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid data', details: parsed.error.format() });
    return;
  }

  const existing = await prisma.event.findFirst({
    where: { id: req.params.id, userId: req.userId! },
  });
  if (!existing) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  const updated = await prisma.event.update({
    where: { id: req.params.id },
    data: parsed.data,
  });

  io.to(`user_${req.userId}`).emit('event:updated', updated);
  res.json(updated);
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const existing = await prisma.event.findFirst({
    where: { id: req.params.id, userId: req.userId! },
  });
  if (!existing) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  await prisma.event.delete({ where: { id: req.params.id } });

  io.to(`user_${req.userId}`).emit('event:deleted', { id: req.params.id });
  res.status(204).send();
});

export default router;
