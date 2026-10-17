/** Поделиться ссылкой: системное меню «Поделиться», а если его нет — копирование в буфер обмена. */
export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // пробуем запасной способ
  }
  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

export async function shareLink(url: string, title: string, text: string): Promise<ShareResult> {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
      // системное меню не открылось — копируем
    }
  }
  return (await copyText(url)) ? 'copied' : 'failed';
}
