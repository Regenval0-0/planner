import { Resend } from 'resend';

let resend: Resend | null = null;

export async function initMailer() {
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    resend = new Resend(apiKey);
    console.log('Resend mailer ready');
  } else {
    console.warn('RESEND_API_KEY not set. Emails will be logged to console.');
    resend = null;
  }
}

function getFromEmail(): string {
  const appUrl = process.env.APP_URL || '';
  if (appUrl.includes('localhost')) {
    return 'onboarding@resend.dev'; // Resend test domain
  }
  const domain = appUrl.replace(/^https?:\/\//, '').split('/')[0];
  return `no-reply@${domain}`;
}

export async function sendVerificationCode(to: string, code: string): Promise<string | null> {
  const subject = 'Код подтверждения';
  const html = `
    <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
      <h2 style="color: #0ea5e9;">Подтверждение email</h2>
      <p>Ваш код подтверждения:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 16px; background: #f3f4f6; border-radius: 8px; text-align: center; color: #111827;">
        ${code}
      </div>
      <p style="color: #6b7280; font-size: 14px;">Код действителен 15 минут. Если вы не регистрировались, проигнорируйте это письмо.</p>
    </div>
  `;

  if (!resend) {
    console.log(`[EMAIL LOG] To: ${to} | Subject: ${subject} | Code: ${code}`);
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to,
      subject,
      html,
      text: `Ваш код подтверждения: ${code}`,
    });
    if (error) {
      console.error('Resend error:', error);
      console.log(`[EMAIL FALLBACK] To: ${to} | Code: ${code}`);
      return null;
    }
    console.log(`Verification email sent: ${data?.id}`);
    return null; // Resend doesn't provide preview URLs
  } catch (err) {
    console.error('Email send failed:', err);
    console.log(`[EMAIL FALLBACK] To: ${to} | Code: ${code}`);
    return null;
  }
}

export async function sendResetCode(to: string, code: string): Promise<string | null> {
  const subject = 'Сброс пароля';
  const html = `
    <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Сброс пароля</h2>
      <p>Ваш код для сброса пароля:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 16px; background: #f3f4f6; border-radius: 8px; text-align: center; color: #111827;">
        ${code}
      </div>
      <p style="color: #6b7280; font-size: 14px;">Код действителен 15 минут. Если вы не запрашивали сброс, проигнорируйте это письмо.</p>
    </div>
  `;

  if (!resend) {
    console.log(`[EMAIL LOG] To: ${to} | Subject: ${subject} | Code: ${code}`);
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to,
      subject,
      html,
      text: `Ваш код для сброса пароля: ${code}`,
    });
    if (error) {
      console.error('Resend error:', error);
      console.log(`[EMAIL FALLBACK] To: ${to} | Code: ${code}`);
      return null;
    }
    console.log(`Reset email sent: ${data?.id}`);
    return null;
  } catch (err) {
    console.error('Email send failed:', err);
    console.log(`[EMAIL FALLBACK] To: ${to} | Code: ${code}`);
    return null;
  }
}
