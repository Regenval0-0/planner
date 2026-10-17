// Проверка перед сборкой для RuStore и Windows: в сборку должен быть встроен адрес сервера.
import { readFileSync, existsSync } from 'node:fs';

function readEnvFile(file) {
  if (!existsSync(file)) return {};
  const out = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

const env = { ...readEnvFile('.env'), ...readEnvFile('.env.production'), ...process.env };
const url = (env.VITE_BACKEND_URL || '').trim();
const email = (env.VITE_SUPPORT_EMAIL || 'regenschopfer@mail.ru').trim();
let failed = false;

if (!url) {
  console.error('\n✖ Не задан адрес сервера VITE_BACKEND_URL.');
  console.error('  Создайте файл frontend/planner/.env.production по образцу .env.production.example\n');
  failed = true;
} else if (!/^https:\/\//.test(url)) {
  console.error(`\n✖ Адрес сервера должен начинаться с https:// (сейчас: ${url}).`);
  console.error('  Android не пускает приложение на сервер без HTTPS.\n');
  failed = true;
} else {
  console.log(`✓ Сервер: ${url}`);
}

if (!email) {
  console.warn('! Не задан VITE_SUPPORT_EMAIL — в политике конфиденциальности не будет контакта (RuStore может отклонить).');
} else {
  console.log(`✓ Почта поддержки: ${email}`);
}

if (failed) process.exit(1);
