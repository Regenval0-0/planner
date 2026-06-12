// Centralized configuration — сервер не стартует без обязательных переменных

const secret = process.env.JWT_SECRET;

if (!secret || secret.length < 32) {
  console.error('FATAL: JWT_SECRET environment variable is required and must be at least 32 characters');
  process.exit(1);
}

export const JWT_SECRET: string = secret;
