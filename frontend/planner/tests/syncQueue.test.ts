import { test } from 'node:test';
import assert from 'node:assert/strict';
import { enqueue, applyQueue, applyServerResult, removeAction, type PendingAction } from '../src/sync/syncQueue.ts';
import type { EventCreate, EventItem } from '../src/api/events.ts';

const payload: EventCreate = {
  title: 'Встреча', description: null, startDate: '2026-03-01T10:00:00.000Z', endDate: null,
  type: 'meeting', recurrence: null, recurrenceEnd: null, recurrenceInterval: null, amount: null, reminderMinutes: null,
};
const server: EventItem = { ...payload, id: 's1', userId: 'u', createdAt: '', updatedAt: '' };

test('создание и правка офлайн схлопываются в одно создание', () => {
  let q: PendingAction[] = [];
  q = enqueue(q, { op: 'create', id: 'n1', payload, ts: 1 });
  q = enqueue(q, { op: 'update', id: 'n1', payload: { title: 'Новое' }, ts: 2 });
  assert.equal(q.length, 1);
  assert.equal(q[0].op, 'create');
  assert.equal((q[0] as Extract<PendingAction, { op: 'create' }>).payload.title, 'Новое');
});

test('создание и удаление офлайн не отправляют ничего', () => {
  let q: PendingAction[] = [];
  q = enqueue(q, { op: 'create', id: 'n1', payload, ts: 1 });
  q = enqueue(q, { op: 'update', id: 'n1', payload: { title: 'x' }, ts: 2 });
  q = enqueue(q, { op: 'delete', id: 'n1', ts: 3 });
  assert.equal(q.length, 0);
});

test('несколько правок серверного события объединяются, удаление их заменяет', () => {
  let q: PendingAction[] = [];
  q = enqueue(q, { op: 'update', id: 's1', payload: { title: 'a' }, ts: 1 });
  q = enqueue(q, { op: 'update', id: 's1', payload: { amount: 5 }, ts: 2 });
  assert.equal(q.length, 1);
  assert.deepEqual((q[0] as Extract<PendingAction, { op: 'update' }>).payload, { title: 'a', amount: 5 });
  q = enqueue(q, { op: 'delete', id: 's1', ts: 3 });
  assert.deepEqual(q.map((a) => a.op), ['delete']);
});

test('applyQueue показывает изменения поверх серверных данных', () => {
  const q: PendingAction[] = [
    { op: 'create', id: 'n1', payload: { ...payload, startDate: '2026-02-01T00:00:00.000Z' }, ts: 1 },
    { op: 'update', id: 's1', payload: { title: 'Изменено' }, ts: 2 },
  ];
  const list = applyQueue([server], q, 'u');
  assert.deepEqual(list.map((e) => e.id), ['n1', 's1']);
  assert.equal(list[1].title, 'Изменено');
  assert.equal(applyQueue([server], [{ op: 'delete', id: 's1', ts: 1 }], 'u').length, 0);
});

test('applyServerResult и removeAction', () => {
  const a: PendingAction = { op: 'create', id: 'n1', payload, ts: 1 };
  const created: EventItem = { ...server, id: 'n1' };
  assert.equal(applyServerResult([server], a, created).length, 2);
  assert.equal(applyServerResult([server], { op: 'delete', id: 's1', ts: 1 }, null).length, 0);
  assert.equal(removeAction([a], a).length, 0);
});
