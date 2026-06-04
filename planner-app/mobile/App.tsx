import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { fetchCalendarItems, type CalendarItem } from '@planner/shared';

export default function App() {
  const [items, setItems] = useState<CalendarItem[]>([]);

  useEffect(() => {
    // Demo: load items for demo user (localStorage shared via same origin if web)
    fetchCalendarItems('demo').then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Planner Mobile</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>{new Date(item.start_date).toLocaleString('ru-RU')}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Нет записей</Text>}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#0ea5e9',
  },
  item: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  empty: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 24,
  },
});
