export interface Command {
  type: 'create' | 'show' | 'delete' | 'clear' | 'unknown';
  raw: string;
  payload?: string;
}
