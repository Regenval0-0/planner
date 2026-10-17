// Запуск: node --test tests/  (Node 22+)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { expandEvents, nthOccurrence, monthGridRange } from '../src/utils/recurrence.ts';
import type { EventItem } from '../src/api/events.ts';

function ev(p: Partial<EventItem>): EventItem {
  return {
    id: 'e1', userId: 'u', title: 't', description: null,
    startDate: new Date(2026, 0, 31, 10, 0).toISOString(), endDate: null,
    type: 'payment', recurrence: null, recurrenceEnd: null, recurrenceInterval: null,
    amount: null, reminderMinutes: null, createdAt: '', updatedAt: '', ...p,
  };
}

test('ежемесячно с 31-го не сползает', () => {
  const s = new Date(2026, 0, 31, 10, 0);
  const days = [0, 1, 2, 3, 4].map((n) => nthOccurrence(s, 'monthly', n).getDate());
  assert.deepEqual(days, [31, 28, 31, 30, 31]);
  assert.equal(nthOccurrence(s, 'monthly', 1).getHours(), 10);
});

test('29 февраля ежегодно', () => {
  const s = new Date(2028, 1, 29);
  assert.equal(nthOccurrence(s, 'yearly', 1).getDate(), 28);
  assert.equal(nthOccurrence(s, 'yearly', 4).getDate(), 29);
});

test('раскрытие в пределах месяца', () => {
  const e = ev({ recurrence: 'monthly' });
  const { from, to } = monthGridRange(2026, 2); // март
  const list = expandEvents([e], new Date(2026, 2, 1), new Date(2026, 2, 31, 23, 59));
  assert.equal(list.length, 1);
  assert.equal(new Date(list[0].startDate).getDate(), 31);
  assert.equal(list[0].originId, 'e1');
  assert.ok(list[0].isRecurrenceInstance);
  assert.ok(from <= new Date(2026, 2, 1) && to >= new Date(2026, 2, 31));
});

test('повтор до даты включительно и не раньше начала', () => {
  const e = ev({
    recurrence: 'daily',
    startDate: new Date(2026, 4, 10, 9).toISOString(),
    recurrenceEnd: new Date(2026, 4, 12, 23, 59, 59).toISOString(),
  });
  const list = expandEvents([e], new Date(2026, 4, 1), new Date(2026, 4, 31));
  assert.deepEqual(list.map((x) => new Date(x.startDate).getDate()), [10, 11, 12]);
  assert.equal(list[0].id, 'e1');
});

test('многодневное повторяющееся событие попадает в период', () => {
  const e = ev({
    type: 'event', recurrence: 'weekly',
    startDate: new Date(2026, 0, 5, 20).toISOString(),
    endDate: new Date(2026, 0, 7, 8).toISOString(),
  });
  const list = expandEvents([e], new Date(2026, 5, 3, 0), new Date(2026, 5, 3, 23, 59));
  assert.equal(list.length, 1);
});

test('далёкое будущее считается быстро', () => {
  const e = ev({ recurrence: 'daily', startDate: new Date(2020, 0, 1).toISOString() });
  const t = Date.now();
  const list = expandEvents([e], new Date(2035, 0, 1), new Date(2035, 0, 31, 23, 59));
  assert.equal(list.length, 31);
  assert.ok(Date.now() - t < 200);
});

test('каждые N дней', () => {
  const e = ev({ recurrence: 'custom', recurrenceInterval: 28, startDate: new Date(2026, 0, 1).toISOString() });
  const list = expandEvents([e], new Date(2026, 0, 1), new Date(2026, 2, 31));
  assert.deepEqual(list.map((x) => new Date(x.startDate).getDate()), [1, 29, 26, 26]);
});

test('обычные события вне периода отбрасываются', () => {
  const e = ev({ startDate: new Date(2026, 0, 1).toISOString() });
  assert.equal(expandEvents([e], new Date(2026, 1, 1), new Date(2026, 1, 28)).length, 0);
});
