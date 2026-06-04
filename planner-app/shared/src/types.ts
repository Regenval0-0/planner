export type CalendarItemType = 'task' | 'event' | 'meeting';
export type Priority = 'low' | 'medium' | 'high';
export type Status = 'pending' | 'completed' | 'cancelled';

export interface CalendarItem {
  id: string;
  user_id: string;
  type: CalendarItemType;
  title: string;
  description: string | null;
  start_date: string; // ISO 8601
  end_date: string | null; // ISO 8601
  priority: Priority;
  status: Status;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export type CalendarItemInsert = Omit<CalendarItem, 'id' | 'created_at' | 'updated_at'>;
export type CalendarItemUpdate = Partial<CalendarItemInsert>;
