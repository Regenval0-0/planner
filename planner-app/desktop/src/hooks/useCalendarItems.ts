import { useState, useEffect, useCallback } from 'react';
import {
  fetchCalendarItems,
  createCalendarItem,
  updateCalendarItem,
  deleteCalendarItem,
  subscribeToCalendarItems,
  type CalendarItem,
  type CalendarItemInsert,
  type CalendarItemUpdate,
} from '@planner/shared';

export function useCalendarItems(userId: string | null) {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || typeof window === 'undefined') {
      setItems([]);
      setLoading(false);
      return;
    }

    let mounted = true;
    let channel: ReturnType<typeof subscribeToCalendarItems> | null = null;

    async function load() {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCalendarItems(userId);
        if (mounted) {
          setItems(data);
        }
      } catch (e: any) {
        console.error('[useCalendarItems] Failed to load items', e);
        if (mounted) {
          setError(e?.message || 'Не удалось загрузить записи');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    try {
      channel = subscribeToCalendarItems(userId, (updated) => {
        if (mounted) {
          setItems(updated);
        }
      });
    } catch (e: any) {
      console.error('[useCalendarItems] Subscription error:', e);
      if (mounted) setError(e?.message || 'Ошибка подписки на обновления');
    }

    return () => {
      mounted = false;
      try {
        channel?.unsubscribe();
      } catch (e) {
        console.warn('[useCalendarItems] Unsubscribe error:', e);
      }
    };
  }, [userId]);

  const addItem = useCallback(
    async (item: Omit<CalendarItemInsert, 'user_id'>) => {
      if (!userId) return;
      setError(null);
      try {
        const created = await createCalendarItem({ ...item, user_id: userId });
        setItems((prev) =>
          [...prev, created].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
        );
        return created;
      } catch (e: any) {
        console.error('[useCalendarItems] addItem error:', e);
        setError(e?.message || 'Не удалось создать запись');
        throw e;
      }
    },
    [userId]
  );

  const updateItem = useCallback(async (id: string, changes: CalendarItemUpdate) => {
    setError(null);
    try {
      const updated = await updateCalendarItem(id, changes);
      setItems((prev) =>
        prev
          .map((i) => (i.id === id ? updated : i))
          .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      );
      return updated;
    } catch (e: any) {
      console.error('[useCalendarItems] updateItem error:', e);
      setError(e?.message || 'Не удалось обновить запись');
      throw e;
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    setError(null);
    try {
      await deleteCalendarItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e: any) {
      console.error('[useCalendarItems] deleteItem error:', e);
      setError(e?.message || 'Не удалось удалить запись');
      throw e;
    }
  }, []);

  return { items, loading, error, addItem, updateItem, deleteItem };
}
