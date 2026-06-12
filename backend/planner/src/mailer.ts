import { Resend } from 'resend';
import nodemailer from 'nodemailer';

let resend: Resend | null = null;
let transporter: nodemailer.Transporter | null = null;
let mailerReady = false;
let fromEmail = '';

export async function initMailer() {
  // 1. Пробуем SMTP (любая почта Mail.ru / Yandex / Gmail)
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();

  if (smtpHost && smtpUser && smtpPass) {
    try {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
        tls: { rejectUnauthorized: false },
      });
      await transporter.verify();
      fromEmail = smtpUser;
      mailerReady = true;
      console.log('✅ SMTP mailer ready:', smtpHost);
      return;
    } catch (err) {
      console.error('❌ SMTP connection failed:', err);
      transporter = null;
    }
  }

  // 2. Пробуем Resend
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (apiKey && apiKey.startsWith('re_')) {
    resend = new Resend(apiKey);
    fromEmail = 'onboarding@resend.dev';
    mailerReady = true;
    console.log('✅ Resend mailer ready');
    return;
  }

  console.warn('⚠️ No mailer configured. Email verification disabled.');
  mailerReady = false;
}

export function isMailerReady(): boolean {
  return mailerReady;
}

export function getFromEmail(): string {
  return fromEmail;
}

async function sendViaSmtp(to: string, subject: string, html: string, text: string): Promise<boolean> {
  if (!transporter) return false;
  try {
    const info = await transporter.sendMail({ from: fromEmail, to, subject, html, text });
    console.log('✅ SMTP email sent:', info.messageId);
    return true;
  } catch (err) {
    console.error('SMTP send failed:', err);
    return false;
  }
}

async function sendViaResend(to: string, subject: string, html: string, text: string): Promise<boolean> {
  if (!resend) return false;
  try {
    const { data, error } = await resend.emails.send({ from: fromEmail, to, subject, html, text });
    if (error) {
      console.error('Resend error:', error);
      return false;
    }
    console.log('✅ Resend email sent:', data?.id);
    return true;
  } catch (err) {
    console.error('Resend send failed:', err);
    return false;
  }
}

function buildEmail(code: string, title: string): { html: string; text: string } {
  const html = `
    <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
      <h2 style="color: #0ea5e9;">${title}</h2>
      <p>Ваш код:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 16px; background: #f3f4f6; border-radius: 8px; text-align: center; color: #111827;">${code}</div>
      <p style="color: #6b7280; font-size: 14px;">Код действителен 15 минут. Если вы не запрашивали это, проигнорируйте письмо.</p>
    </div>
  `;
  const text = `Ваш код: ${code}`;
  return { html, text };
}

export async function sendVerificationCode(to: string, code: string): Promise<boolean> {
  const { html, text } = buildEmail(code, 'Подтверждение email — Планер');
  if (transporter) return sendViaSmtp(to, 'Код подтверждения — Планер', html, text);
  if (resend) return sendViaResend(to, 'Код подтверждения — Планер', html, text);
  console.log(`[DEV] Verification code for ${to}: ${code}`);
  return false;
}

export async function sendResetCode(to: string, code: string): Promise<boolean> {
  const { html, text } = buildEmail(code, 'Сброс пароля — Планер');
  if (transporter) return sendViaSmtp(to, 'Сброс пароля — Планер', html, text);
  if (resend) return sendViaResend(to, 'Сброс пароля — Планер', html, text);
  console.log(`[DEV] Reset code for ${to}: ${code}`);
  return false;
}
