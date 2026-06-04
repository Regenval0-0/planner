import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useCalendarItems } from './hooks/useCalendarItems';
import { AuthForm } from './components/AuthForm';
import { ItemList } from './components/ItemList';
import { ItemForm } from './components/ItemForm';
import { CalendarItemType } from '@planner/shared';

export default function App() {
  const { user, loading: authLoading, error: authError, signIn, signUp, logout } = useAuth();
  const { items, loading: itemsLoading, error: itemsError, addItem, updateItem, deleteItem } = useCalendarItems(user?.id || null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [filter, setFilter] = useState<CalendarItemType | 'all'>('all');
  const [search, setSearch] = useState('');

  const handleToggleWidget = useCallback(() => {
    window.electronAPI?.toggleWidget();
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSignIn={signIn} onSignUp={signUp} />;
  }

  const filteredItems = (filter === 'all' ? items : items.filter((i) => i.type === filter))
    .filter((i) => search.trim() === '' || i.title.toLowerCase().includes(search.toLowerCase()));

  // Send upcoming items to main process for notifications
  useEffect(() => {
    if (!window.electronAPI || !user) return;
    const upcoming = [...items]
      .filter((i) => i.status === 'pending')
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .slice(0, 20)
      .map((i) => ({ id: i.id, title: i.title, start_date: i.start_date, type: i.type }));
    window.electronAPI.setUpcomingItems(upcoming);
  }, [items, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-planner-50 to-white">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-planner-500 flex items-center justify-center text-white font-bold">
            П
          </div>
          <h1 className="text-xl font-semibold text-gray-800">Planner</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleWidget}
            className="px-3 py-1.5 text-sm bg-planner-100 text-planner-700 rounded-md hover:bg-planner-200 transition"
          >
            Виджет
          </button>
          <div className="text-sm text-gray-500">{user.email}</div>
          <button
            onClick={logout}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
          >
            Выйти
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        {(authError || itemsError) && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
            {authError || itemsError}
          </div>
        )}

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as CalendarItemType | 'all')}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-planner-500"
          >
            <option value="all">Все</option>
            <option value="task">Задачи</option>
            <option value="event">События</option>
            <option value="meeting">Встречи</option>
          </select>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-planner-500 w-48"
          />

          <button
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-planner-500 text-white rounded-lg text-sm font-medium hover:bg-planner-600 transition ml-auto"
          >
            + Добавить
          </button>
        </div>

        {showForm && (
          <ItemForm
            key={editingItem || 'new'}
            onSubmit={async (data) => {
              if (editingItem) {
                await updateItem(editingItem, data);
              } else {
                await addItem(data);
              }
              setShowForm(false);
              setEditingItem(null);
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
            initialData={editingItem ? items.find((i) => i.id === editingItem) : undefined}
          />
        )}

        <ItemList
          items={filteredItems}
          loading={itemsLoading}
          onEdit={(id) => {
            setEditingItem(id);
            setShowForm(true);
          }}
          onDelete={deleteItem}
          onToggleStatus={(id, status) => updateItem(id, { status })}
        />
      </main>
    </div>
  );
}
