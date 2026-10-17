import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';
import { checkRateLimit, resetAttempts, clientIp, retryMessage } from '../utils/rateLimit.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { signToken } from '../lib/tokens.js';
import { Prisma } from '@prisma/client';
import { emitToUser } from '../lib/realtime.js';

const router = Router();

const MIN = 60 * 1000;

const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Логин — от 3 символов')
  .max(30, 'Логин — до 30 символов')
  .regex(/^[A-Za-zА-Яа-яЁё0-9_.-]+$/, 'Логин может содержать буквы, цифры, точку, дефис и подчёркивание');

// bcrypt учитывает только первые 72 байта, поэтому ограничиваем длину.
const passwordSchema = z.string().min(6, 'Пароль — от 6 символов').max(64, 'Пароль — до 64 символов');

const registerSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  securityQuestion: z.string().trim().min(3, 'Придумайте секретный вопрос').max(200),
  securityAnswer: z.string().trim().min(1, 'Укажите ответ на секретный вопрос').max(200),
  acceptPrivacy: z.literal(true, { errorMap: () => ({ message: 'Нужно согласие с политикой конфиденциальности' }) }),
});

const loginSchema = z.object({
  username: z.string().trim().min(1).max(30),
  password: z.string().min(1).max(64),
});

const resetSchema = z.object({
  username: z.string().trim().min(1).max(30),
  securityAnswer: z.string().min(1).max(200),
  newPassword: passwordSchema,
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(64),
  newPassword: passwordSchema,
});

const deleteSchema = z.object({
  password: z.string().min(1).max(64),
});

function firstError(error: z.ZodError, fallback: string): string {
  return error.issues[0]?.message || fallback;
}

/** Ключ логина: регистр и ё/е не важны, поэтому «Dasha», «dasha» и «DASHA» — один и тот же логин. */
export function loginKey(username: string): string {
  return username.trim().toLowerCase().replace(/ё/g, 'е');
}

function publicUser(user: { id: string; username: string; createdAt: Date }) {
  return { id: user.id, username: user.username, createdAt: user.createdAt };
}

function normalizeAnswer(answer: string): string {
  return answer.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
}

// Хеш-заглушка для сравнения, когда логин не найден.
const DUMMY_HASH = bcrypt.hashSync('planner-dummy-password', 10);

// ---------- Регистрация ----------
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const ip = clientIp(req);
    const limit = checkRateLimit('register', ip, 10, 60 * MIN, 60 * MIN);
    if (!limit.allowed) {
      res.status(429).json({ error: retryMessage(limit.retryAfter) });
      return;
    }

    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: firstError(parsed.error, 'Проверьте введённые данные') });
      return;
    }
    const { username, password, securityQuestion, securityAnswer } = parsed.data;
    const usernameKey = loginKey(username);

    if (await prisma.user.findUnique({ where: { usernameKey } })) {
      res.status(409).json({ error: 'Такой логин уже занят' });
      return;
    }

    let user;
    try {
      user = await prisma.user.create({
        data: {
          username,
          usernameKey,
          passwordHash: await bcrypt.hash(password, 10),
          securityQuestion,
          securityAnswer: await bcrypt.hash(normalizeAnswer(securityAnswer), 10),
        },
      });
    } catch (err) {
      // Два человека одновременно регистрируют один логин — второй получает отказ.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        res.status(409).json({ error: 'Такой логин уже занят' });
        return;
      }
      throw err;
    }

    res.status(201).json({ user: publicUser(user), token: signToken(user) });
  }),
);

// ---------- Вход ----------
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Введите логин и пароль' });
      return;
    }
    const { username, password } = parsed.data;
    const ip = clientIp(req);

    // Лимит по паре «IP + логин» и общий по IP: чужой человек не сможет
    // заблокировать вход владельцу аккаунта со своего устройства.
    const pairLimit = checkRateLimit('login', `${ip}:${loginKey(username)}`, 5, 15 * MIN, 15 * MIN);
    const ipLimit = checkRateLimit('login-ip', ip, 30, 15 * MIN, 15 * MIN);
    if (!pairLimit.allowed || !ipLimit.allowed) {
      res.status(429).json({ error: retryMessage(pairLimit.retryAfter ?? ipLimit.retryAfter) });
      return;
    }

    const user = await prisma.user.findUnique({ where: { usernameKey: loginKey(username) } });
    // Сравниваем хеш даже для несуществующего логина, чтобы время ответа не выдавало, есть ли такой пользователь.
    const hash = user?.passwordHash ?? DUMMY_HASH;
    const valid = await bcrypt.compare(password, hash);
    if (!user || !valid) {
      res.status(401).json({ error: 'Неверный логин или пароль' });
      return;
    }

    resetAttempts('login', `${ip}:${loginKey(username)}`);
    res.json({ user: publicUser(user), token: signToken(user) });
  }),
);

// ---------- Секретный вопрос по логину ----------
router.get(
  '/question/:username',
  asyncHandler(async (req, res) => {
    const ip = clientIp(req);
    const limit = checkRateLimit('question', ip, 10, 15 * MIN, 30 * MIN);
    if (!limit.allowed) {
      res.status(429).json({ error: retryMessage(limit.retryAfter) });
      return;
    }
    const username = String(req.params.username || '').trim();
    if (username.length < 3) {
      res.status(400).json({ error: 'Введите корректный логин' });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { usernameKey: loginKey(username) },
      select: { securityQuestion: true },
    });
    if (!user) {
      res.status(404).json({ error: 'Пользователь не найден' });
      return;
    }
    res.json({ securityQuestion: user.securityQuestion });
  }),
);

// ---------- Сброс пароля по секретному вопросу ----------
router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const parsed = resetSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: firstError(parsed.error, 'Проверьте данные') });
      return;
    }
    const { username, securityAnswer, newPassword } = parsed.data;
    const ip = clientIp(req);

    const userLimit = checkRateLimit('reset', loginKey(username), 5, 60 * MIN, 60 * MIN);
    const ipLimit = checkRateLimit('reset-ip', ip, 10, 60 * MIN, 60 * MIN);
    if (!userLimit.allowed || !ipLimit.allowed) {
      res.status(429).json({ error: retryMessage(userLimit.retryAfter ?? ipLimit.retryAfter) });
      return;
    }

    const user = await prisma.user.findUnique({ where: { usernameKey: loginKey(username) } });
    if (!user) {
      res.status(404).json({ error: 'Пользователь не найден' });
      return;
    }
    const valid = await bcrypt.compare(normalizeAnswer(securityAnswer), user.securityAnswer);
    // Для аккаунтов, созданных до нормализации ответа (ё/пробелы), проверяем и старый вариант.
    const validLegacy = valid || (await bcrypt.compare(securityAnswer.toLowerCase().trim(), user.securityAnswer));
    if (!validLegacy) {
      res.status(400).json({ error: 'Неверный ответ на секретный вопрос' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(newPassword, 10), tokenVersion: { increment: 1 } },
    });
    resetAttempts('reset', loginKey(username));
    emitToUser(user.id, 'session:revoked', {});
    res.json({
      message: 'Пароль изменён',
      user: publicUser(updated),
      token: signToken(updated),
    });
  }),
);

// ---------- Текущий пользователь (заодно продлевает токен) ----------
router.get(
  '/me',
  authMiddleware,
  asyncHandler<AuthRequest>(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) {
      res.status(401).json({ error: 'Пользователь не найден' });
      return;
    }
    res.json({
      user: publicUser(user),
      token: signToken(user),
    });
  }),
);

// ---------- Смена пароля (выход на остальных устройствах) ----------
router.post(
  '/change-password',
  authMiddleware,
  asyncHandler<AuthRequest>(async (req, res) => {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: firstError(parsed.error, 'Проверьте данные') });
      return;
    }
    const limit = checkRateLimit('change-pass', req.userId!, 5, 15 * MIN, 15 * MIN);
    if (!limit.allowed) {
      res.status(429).json({ error: retryMessage(limit.retryAfter) });
      return;
    }
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user || !(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) {
      res.status(400).json({ error: 'Текущий пароль указан неверно' });
      return;
    }
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 10), tokenVersion: { increment: 1 } },
    });
    emitToUser(user.id, 'session:revoked', {});
    res.json({ message: 'Пароль изменён', token: signToken(updated) });
  }),
);

// ---------- Удаление аккаунта со всеми данными ----------
router.delete(
  '/account',
  authMiddleware,
  asyncHandler<AuthRequest>(async (req, res) => {
    const parsed = deleteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Введите пароль для подтверждения' });
      return;
    }
    const limit = checkRateLimit('delete-account', req.userId!, 5, 15 * MIN, 15 * MIN);
    if (!limit.allowed) {
      res.status(429).json({ error: retryMessage(limit.retryAfter) });
      return;
    }
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
      res.status(400).json({ error: 'Неверный пароль' });
      return;
    }
    // События удаляются каскадно (onDelete: Cascade).
    await prisma.user.delete({ where: { id: user.id } });
    emitToUser(user.id, 'session:revoked', {});
    res.status(204).send();
  }),
);

export default router;
