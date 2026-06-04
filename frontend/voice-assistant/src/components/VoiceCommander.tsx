import React from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useCommandParser } from '../hooks/useCommandParser';

export const VoiceCommander: React.FC = () => {
  const {
    listening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    error,
    supported,
  } = useSpeechRecognition('ru-RU');

  const { commands, clearCommands } = useCommandParser(transcript);

  if (!supported) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <h2>🎤 Голосовой помощник</h2>
        <p style={{ color: '#ef4444' }}>
          Web Speech API не поддерживается в этом браузере.
          <br />
          Используйте Google Chrome или Microsoft Edge.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: '720px',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#1f2937',
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>🎤 Голосовой помощник</h2>

      {/* Кнопка записи */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <button
          onClick={listening ? stopListening : startListening}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: 'none',
            background: listening ? '#ef4444' : '#3b82f6',
            color: 'white',
            fontSize: '2rem',
            cursor: 'pointer',
            boxShadow: listening
              ? '0 0 0 0 rgba(239, 68, 68, 0.7)'
              : '0 4px 6px rgba(0,0,0,0.1)',
            animation: listening ? 'pulse 1.5s infinite' : 'none',
            transition: 'background 0.2s ease',
          }}
          title={listening ? 'Остановить запись' : 'Начать запись'}
        >
          {listening ? '⏹' : '🎙'}
        </button>
      </div>

      {listening && (
        <p style={{ textAlign: 'center', color: '#ef4444', fontWeight: 500, marginBottom: '1rem' }}>
          ● Запись идёт… говорите
        </p>
      )}

      {/* Ошибка */}
      {error && (
        <div
          style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Транскрипт */}
      <div
        style={{
          background: '#f3f4f6',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          minHeight: '80px',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
          Распознанный текст
        </div>
        <div style={{ fontSize: '1.125rem', lineHeight: 1.5 }}>
          {transcript}
          <span style={{ color: '#9ca3af' }}>{interimTranscript}</span>
        </div>
      </div>

      {/* Кнопки управления */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={resetTranscript}
          disabled={!transcript && !interimTranscript}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            background: 'white',
            cursor: 'pointer',
            opacity: !transcript && !interimTranscript ? 0.5 : 1,
          }}
        >
          🗑 Очистить текст
        </button>
        <button
          onClick={clearCommands}
          disabled={commands.length === 0}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            background: 'white',
            cursor: 'pointer',
            opacity: commands.length === 0 ? 0.5 : 1,
          }}
        >
          🗑 Очистить команды
        </button>
      </div>

      {/* Распознанные команды */}
      {commands.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '0.75rem' }}>📋 Распознанные команды</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {commands.map((cmd, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: '#eff6ff',
                  borderLeft: '4px solid #3b82f6',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e40af', textTransform: 'uppercase' }}>
                  {cmd.type}
                </div>
                <div style={{ marginTop: '0.25rem', fontSize: '1rem' }}>
                  {cmd.payload ? `${cmd.payload}` : 'Команда без аргументов'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Подсказка */}
      <div
        style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#f0fdf4',
          borderRadius: '10px',
          fontSize: '0.875rem',
          color: '#166534',
        }}
      >
        <strong>💡 Примеры команд:</strong>
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
          <li>«Создай задачу купить молоко»</li>
          <li>«Добавь задачу сделать домашку»</li>
          <li>«Покажи задачи»</li>
          <li>«Удали задачу купить молоко»</li>
          <li>«Очисти всё»</li>
        </ul>
      </div>

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
};
