// Настройки сервера. Сервер не стартует без обязательных переменных окружения.

const secret = process.env.JWT_SECRET;

if (!secret || secret.length < 32) {
  console.error('FATAL: переменная JWT_SECRET обязательна и должна быть не короче 32 символов');
  process.exit(1);
}

export const JWT_SECRET: string = secret;
export const PORT = Number(process.env.PORT) || 3001;
export const IS_PROD = process.env.NODE_ENV === 'production';
/** Срок жизни токена входа. Токен продлевается при каждом запуске приложения (/auth/me). */
export const TOKEN_TTL = '30d';
