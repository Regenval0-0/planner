import type { Server } from 'socket.io';

// Отдельный модуль, чтобы маршруты не импортировали server.ts (циклическая зависимость).
let io: Server | null = null;

export function setIo(server: Server) {
  io = server;
}

export function emitToUser(userId: string, event: string, payload: unknown) {
  io?.to(`user_${userId}`).emit(event, payload);
}
