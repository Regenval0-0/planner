/** Сведения о приложении, которые показываются пользователю. */
export const APP_NAME = 'Планер';
export const APP_VERSION: string = __APP_VERSION__;
/** Почта для обращений по персональным данным и поддержки (VITE_SUPPORT_EMAIL в .env.production). */
export const SUPPORT_EMAIL = (import.meta.env.VITE_SUPPORT_EMAIL || 'regenschopfer@mail.ru').trim();
/** Публичная ссылка на политику конфиденциальности (для карточки RuStore). */
export const PRIVACY_URL =
  'https://github.com/Regenval0-0/planner/blob/main/frontend/planner/rustore-assets/PRIVACY_POLICY.md';
