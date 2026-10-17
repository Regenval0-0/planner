// Интеграционные тесты API на временной базе SQLite.
// Запуск: npm test (сначала собирает dist).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dbFile = path.join(root, 'prisma', 'test.db');
process.env.DATABASE_URL = `file:${dbFile}`;
process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-1234';
process.env.DISABLE_RATE_LIMIT = '1';

let server;
let base;

before(async () => {
  rmSync(dbFile, { force: true });
  execSync('npx prisma migrate deploy', { cwd: root, env: process.env, stdio: 'ignore' });
  const { createApp } = await import('../dist/app.js');
  server = createApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server?.close();
  const { prisma } = await import('../dist/prisma.js');
  await prisma.$disconnect();
  rmSync(dbFile, { force: true });
});

async function api(method, url, body, token) {
  const res = await fetch(base + url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : null };
}

const user = {
  username: 'test_user',
  password: 'secret123',
  securityQuestion: 'Любимый город?',
  securityAnswer: 'Новокузнецк',
  acceptPrivacy: true,
};
let token;

test('health', async () => {
  const r = await api('GET', '/health');
  assert.equal(r.status, 200);
  assert.equal(r.data.ok, true);
});

test('регистрация требует согласия с политикой', async () => {
  const r = await api('POST', '/api/auth/register', { ...user, acceptPrivacy: false });
  assert.equal(r.status, 400);
});

test('регистрация', async () => {
  const r = await api('POST', '/api/auth/register', user);
  assert.equal(r.status, 201, JSON.stringify(r.data));
  assert.equal(r.data.user.username, user.username);
  assert.equal(r.data.user.phone, undefined);
  assert.ok(r.data.token);
  token = r.data.token;
});

test('занятый логин нельзя зарегистрировать повторно (и в другом регистре)', async () => {
  for (const name of ['test_user', 'TEST_USER', 'Test_User', '  test_user  ']) {
    const r = await api('POST', '/api/auth/register', { ...user, username: name });
    assert.equal(r.status, 409, `${name}: ${JSON.stringify(r.data)}`);
    assert.equal(r.data.error, 'Такой логин уже занят');
  }
});

test('одновременная регистрация одного логина: успешна только одна', async () => {
  const results = await Promise.all(
    Array.from({ length: 5 }, (_, i) => api('POST', '/api/auth/register', { ...user, username: i % 2 ? 'Race' : 'race' })),
  );
  const codes = results.map((r) => r.status).sort();
  assert.deepEqual(codes, [201, 409, 409, 409, 409], JSON.stringify(results.map((r) => r.data)));
});

test('ё и е в логине считаются одной буквой', async () => {
  const a = await api('POST', '/api/auth/register', { ...user, username: 'Алёна' });
  assert.equal(a.status, 201, JSON.stringify(a.data));
  const b = await api('POST', '/api/auth/register', { ...user, username: 'алена' });
  assert.equal(b.status, 409);
});

test('вход: неверный и верный пароль', async () => {
  const bad = await api('POST', '/api/auth/login', { username: user.username, password: 'wrong-pass' });
  assert.equal(bad.status, 401);
  const ok = await api('POST', '/api/auth/login', { username: user.username, password: user.password });
  assert.equal(ok.status, 200);
  token = ok.data.token;
  const otherCase = await api('POST', '/api/auth/login', { username: 'TEST_User', password: user.password });
  assert.equal(otherCase.status, 200);
  assert.equal(otherCase.data.user.username, user.username);
});

test('me продлевает токен', async () => {
  const r = await api('GET', '/api/auth/me', null, token);
  assert.equal(r.status, 200);
  assert.equal(r.data.user.username, user.username);
  assert.ok(r.data.token);
  const noAuth = await api('GET', '/api/auth/me');
  assert.equal(noAuth.status, 401);
});

test('поиска логина по телефону больше нет', async () => {
  const r = await api('POST', '/api/auth/find-user', { phone: '+79131234567' });
  assert.equal(r.status, 404);
});

test('события: создание с id, повтор без дубликата, изменение, удаление', async () => {
  const id = randomUUID();
  const ev = {
    id,
    title: 'Аренда',
    type: 'payment',
    startDate: '2026-01-31T00:00:00.000Z',
    recurrence: 'monthly',
    amount: 25000,
  };
  const c1 = await api('POST', '/api/events', ev, token);
  assert.equal(c1.status, 201, JSON.stringify(c1.data));
  assert.equal(c1.data.id, id);
  const c2 = await api('POST', '/api/events', ev, token);
  assert.equal(c2.status, 200);
  const list = await api('GET', '/api/events', null, token);
  assert.equal(list.data.length, 1);

  const upd = await api('PUT', `/api/events/${id}`, { recurrence: null, amount: null, reminderMinutes: 60 }, token);
  assert.equal(upd.status, 200);
  assert.equal(upd.data.recurrence, null);
  assert.equal(upd.data.amount, null);
  assert.equal(upd.data.reminderMinutes, 60);

  const bad = await api('PUT', `/api/events/${id}`, { endDate: '2025-01-01T00:00:00.000Z' }, token);
  assert.equal(bad.status, 400);

  const custom = await api('POST', '/api/events', { title: 'x', startDate: '2026-01-01T00:00:00.000Z', recurrence: 'custom' }, token);
  assert.equal(custom.status, 400);

  const del = await api('DELETE', `/api/events/${id}`, null, token);
  assert.equal(del.status, 204);
  const del2 = await api('DELETE', `/api/events/${id}`, null, token);
  assert.equal(del2.status, 204);
  const missing = await api('PUT', `/api/events/${id}`, { title: 'y' }, token);
  assert.equal(missing.status, 404);
});

test('чужие события недоступны', async () => {
  const other = await api('POST', '/api/auth/register', { ...user, username: 'second' });
  const t2 = other.data.token;
  const id = randomUUID();
  await api('POST', '/api/events', { id, title: 'Личное', startDate: '2026-02-01T10:00:00.000Z' }, token);
  const steal = await api('POST', '/api/events', { id, title: 'Чужое', startDate: '2026-02-01T10:00:00.000Z' }, t2);
  assert.equal(steal.status, 409);
  const put = await api('PUT', `/api/events/${id}`, { title: 'взлом' }, t2);
  assert.equal(put.status, 404);
  const list2 = await api('GET', '/api/events', null, t2);
  assert.equal(list2.data.length, 0);
});

test('смена пароля отзывает старые токены', async () => {
  const old = token;
  const r = await api('POST', '/api/auth/change-password', { currentPassword: user.password, newPassword: 'newpass123' }, token);
  assert.equal(r.status, 200);
  const withOld = await api('GET', '/api/auth/me', null, old);
  assert.equal(withOld.status, 401);
  token = r.data.token;
  const withNew = await api('GET', '/api/auth/me', null, token);
  assert.equal(withNew.status, 200);
});

test('сброс пароля по секретному вопросу (регистр и ё не важны)', async () => {
  const q = await api('GET', `/api/auth/question/${user.username}`);
  assert.equal(q.data.securityQuestion, user.securityQuestion);
  const r = await api('POST', '/api/auth/reset-password', {
    username: user.username,
    securityAnswer: '  новокузнецк ',
    newPassword: 'reset1234',
  });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  token = r.data.token;
});

test('удаление аккаунта удаляет данные', async () => {
  const wrong = await api('DELETE', '/api/auth/account', { password: 'nope' }, token);
  assert.equal(wrong.status, 400);
  const ok = await api('DELETE', '/api/auth/account', { password: 'reset1234' }, token);
  assert.equal(ok.status, 204);
  const login = await api('POST', '/api/auth/login', { username: user.username, password: 'reset1234' });
  assert.equal(login.status, 401);
});
