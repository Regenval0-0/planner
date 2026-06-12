import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { checkRateLimit } from '../utils/rateLimit.js';
import { JWT_SECRET } from '../config.js';

const router = Router();

const registerSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(6),
  phone: z.string().min(5).max(20),
  securityQuestion: z.string().min(3).max(200),
  securityAnswer: z.string().min(1).max(200),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const findUserSchema = z.object({
  phone: z.string(),
});

const resetSchema = z.object({
  username: z.string(),
  securityAnswer: z.string(),
  newPassword: z.string().min(6),
});

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Проверьте данные: логин от 3 симв., пароль от 6, телефон, вопрос и ответ обязательны' });
    return;
  }
  const { username, password, phone, securityQuestion, securityAnswer } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    res.status(409).json({ error: 'Такой логин уже занят' });
    return;
  }

  const existingPhone = await prisma.user.findUnique({ where: { phone } });
  if (existingPhone) {
    res.status(409).json({ error: 'Такой номер телефона уже используется' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const answerHash = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10);

  const user = await prisma.user.create({
    data: { username, passwordHash, phone, securityQuestion, securityAnswer: answerHash },
    select: { id: true, username: true, phone: true, createdAt: true },
  });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ user, token });
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Введите логин и пароль' });
    return;
  }
  const { username, password } = parsed.data;

  const limit = checkRateLimit('login', username, 5, 15 * 60 * 1000, 30 * 60 * 1000);
  if (!limit.allowed) {
    res.status(429).json({ error: `Слишком много попыток. Попробуйте через ${limit.retryAfter} сек.` });
    return;
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    res.status(401).json({ error: 'Неверный логин или пароль' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Неверный логин или пароль' });
    return;
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ user: { id: user.id, username: user.username, phone: user.phone, createdAt: user.createdAt }, token });
});

router.post('/find-user', async (req, res) => {
  const parsed = findUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Введите номер телефона' });
    return;
  }
  const { phone } = parsed.data;

  // Rate limit по IP — max 5 попыток в 1 минуту
  const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown') as string;
  const limit = checkRateLimit('finduser', clientIp, 5, 60 * 1000, 5 * 60 * 1000);
  if (!limit.allowed) {
    res.status(429).json({ error: `Слишком много попыток. Попробуйте через ${limit.retryAfter} сек.` });
    return;
  }

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    res.status(404).json({ error: 'Пользователь с таким номером не найден' });
    return;
  }

  res.json({ username: user.username });
});

// Публичный endpoint для получения секретного вопроса по логину
router.get('/question/:username', async (req, res) => {
  const username = req.params.username;
  if (!username || username.trim().length < 3) {
    res.status(400).json({ error: 'Введите корректный логин' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { username: username.trim() },
    select: { securityQuestion: true },
  });

  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' });
    return;
  }

  res.json({ securityQuestion: user.securityQuestion });
});

router.post('/reset-password', async (req, res) => {
  const parsed = resetSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Проверьте данные: пароль минимум 6 символов' });
    return;
  }
  const { username, securityAnswer, newPassword } = parsed.data;

  // Защита от перебора ответа: max 3 попытки в 15 минут
  const limit = checkRateLimit('reset', username, 3, 15 * 60 * 1000, 30 * 60 * 1000);
  if (!limit.allowed) {
    res.status(429).json({ error: `Слишком много попыток. Попробуйте через ${limit.retryAfter} сек.` });
    return;
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' });
    return;
  }

  const valid = await bcrypt.compare(securityAnswer.toLowerCase().trim(), user.securityAnswer);
  if (!valid) {
    res.status(400).json({ error: 'Неверный ответ на секретный вопрос' });
    return;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ message: 'Пароль успешно изменён', token });
});

router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, username: true, phone: true, createdAt: true },
  });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
});

export default router;
