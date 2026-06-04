import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { sendVerificationCode, sendResetCode } from '../mailer.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const forgotSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(6),
});

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid data', details: parsed.error.format() });
    return;
  }

  const { email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: 'User already exists' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const code = generateCode();
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 минут

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      verificationCode: code,
      verificationCodeExpires: expires,
    },
    select: { id: true, email: true, createdAt: true, emailVerified: true },
  });

  const previewUrl = await sendVerificationCode(email, code);

  res.status(201).json({
    user: { id: user.id, email: user.email, createdAt: user.createdAt },
    message: 'Registration successful. Check your email for verification code.',
    previewUrl,
    code: previewUrl ? undefined : code, // показываем код если нет реального SMTP
  });
});

router.post('/verify', async (req, res) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid data', details: parsed.error.format() });
    return;
  }

  const { email, code } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (user.emailVerified) {
    res.status(400).json({ error: 'Email already verified' });
    return;
  }

  if (user.verificationCode !== code || !user.verificationCodeExpires || user.verificationCodeExpires < new Date()) {
    res.status(400).json({ error: 'Invalid or expired code' });
    return;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationCode: null,
      verificationCodeExpires: null,
    },
    select: { id: true, email: true, createdAt: true, emailVerified: true },
  });

  const token = jwt.sign({ userId: updated.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ user: updated, token, message: 'Email verified successfully' });
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid data', details: parsed.error.format() });
    return;
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  if (!user.emailVerified) {
    res.status(403).json({ error: 'Email not verified. Please check your email.' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ user: { id: user.id, email: user.email, createdAt: user.createdAt }, token });
});

router.post('/forgot-password', async (req, res) => {
  const parsed = forgotSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid data', details: parsed.error.format() });
    return;
  }

  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const code = generateCode();
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 минут

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetCode: code,
      resetCodeExpires: expires,
    },
  });

  const previewUrl = await sendResetCode(email, code);

  res.json({
    message: 'Reset code sent to your email',
    previewUrl,
    code: previewUrl ? undefined : code,
  });
});

router.post('/reset-password', async (req, res) => {
  const parsed = resetSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid data', details: parsed.error.format() });
    return;
  }

  const { email, code, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (user.resetCode !== code || !user.resetCodeExpires || user.resetCodeExpires < new Date()) {
    res.status(400).json({ error: 'Invalid or expired code' });
    return;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetCode: null,
      resetCodeExpires: null,
    },
    select: { id: true, email: true, createdAt: true, emailVerified: true },
  });

  const token = jwt.sign({ userId: updated.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ user: updated, token, message: 'Password reset successfully' });
});

router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, createdAt: true },
  });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
});

export default router;
