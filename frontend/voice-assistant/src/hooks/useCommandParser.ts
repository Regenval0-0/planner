import { useState, useEffect, useCallback } from 'react';
import type { Command } from '../types';

const CREATE_KEYWORDS = ['создай', 'добавь', 'новая задача', 'создать', 'добавить'];
const SHOW_KEYWORDS = ['покажи', 'показать', 'список', 'все задачи', 'выведи'];
const DELETE_KEYWORDS = ['удали', 'удалить', 'убери', 'убрать', 'очисти задачу'];
const CLEAR_KEYWORDS = ['очисти всё', 'очистить всё', 'удали всё', 'сброс', 'сбросить'];

function parseCommand(text: string): Command | null {
  const lower = text.toLowerCase().trim();
  if (!lower) return null;

  // Проверяем ключевые слова по порядку приоритета
  for (const kw of CLEAR_KEYWORDS) {
    if (lower.includes(kw)) {
      return { type: 'clear', raw: text };
    }
  }

  for (const kw of DELETE_KEYWORDS) {
    if (lower.includes(kw)) {
      const payload = extractPayload(text, kw);
      return { type: 'delete', raw: text, payload };
    }
  }

  for (const kw of SHOW_KEYWORDS) {
    if (lower.includes(kw)) {
      return { type: 'show', raw: text };
    }
  }

  for (const kw of CREATE_KEYWORDS) {
    if (lower.includes(kw)) {
      const payload = extractPayload(text, kw);
      return { type: 'create', raw: text, payload };
    }
  }

  return { type: 'unknown', raw: text };
}

function extractPayload(text: string, keyword: string): string | undefined {
  const idx = text.toLowerCase().indexOf(keyword);
  if (idx === -1) return undefined;
  const after = text.slice(idx + keyword.length).trim();
  // Убираем часто встречающиеся союзы
  return after.replace(/^(задачу|задача|задач|task|заметку|заметка|todo)\s*/i, '').trim() || undefined;
}

export function useCommandParser(transcript: string) {
  const [commands, setCommands] = useState<Command[]>([]);
  const [parsedTexts, setParsedTexts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!transcript) return;

    // Разбиваем транскрипт на предложения/части (по паузам или точкам)
    const chunks = transcript.split(/[.!?]\s+/).filter(Boolean);

    const newCommands: Command[] = [];
    const newParsed = new Set(parsedTexts);

    for (const chunk of chunks) {
      const trimmed = chunk.trim();
      if (newParsed.has(trimmed)) continue;

      const cmd = parseCommand(trimmed);
      if (cmd) {
        newCommands.push(cmd);
        newParsed.add(trimmed);
      }
    }

    if (newCommands.length > 0) {
      setCommands((prev) => [...prev, ...newCommands]);
      setParsedTexts(newParsed);
    }
  }, [transcript]);

  const clearCommands = useCallback(() => {
    setCommands([]);
    setParsedTexts(new Set());
  }, []);

  return { commands, clearCommands };
}
