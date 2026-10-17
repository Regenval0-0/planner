/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Адрес сервера, встроенный в сборку, например https://api.example.ru */
  readonly VITE_BACKEND_URL?: string;
  /** Почта поддержки для политики конфиденциальности. */
  readonly VITE_SUPPORT_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_VERSION__: string;
