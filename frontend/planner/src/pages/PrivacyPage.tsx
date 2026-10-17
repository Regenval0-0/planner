import { useNavigate } from 'react-router-dom';
import { PRIVACY_SECTIONS, PRIVACY_UPDATED } from '../config/privacy.ts';
import { APP_NAME, SUPPORT_EMAIL } from '../config/app.ts';

export default function PrivacyPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 safe-area safe-top">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
          className="mb-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          ← Назад
        </button>
        <article className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 sm:p-8 text-gray-700 dark:text-gray-300">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Политика конфиденциальности</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Приложение «{APP_NAME}». Редакция от {PRIVACY_UPDATED}
          </p>
          {PRIVACY_SECTIONS.map((section) => (
            <section key={section.title} className="mt-6">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{section.title}</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
          <section className="mt-6">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">7. Контакты</h2>
            <p className="text-sm">
              {SUPPORT_EMAIL ? (
                <>
                  По вопросам обработки данных пишите на{' '}
                  <a className="text-[var(--color-primary)] underline" href={`mailto:${SUPPORT_EMAIL}`}>
                    {SUPPORT_EMAIL}
                  </a>
                  .
                </>
              ) : (
                'По вопросам обработки данных обращайтесь к разработчику через страницу приложения в RuStore.'
              )}
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
