import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import { PORT } from './config.js';
import { createApp } from './app.js';
import { prisma } from './prisma.js';
import { setIo } from './lib/realtime.js';
import { verifyToken } from './lib/tokens.js';

const app = createApp();
const server = http.createServer(app);

// Socket.IO: мгновенная синхронизация между устройствами одного пользователя.
const io = new Server(server, {
  cors: { origin: true },
  pingInterval: 25000,
  pingTimeout: 20000,
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (typeof token !== 'string' || !token) {
    next(new Error('unauthorized'));
    return;
  }
  verifyToken(token)
    .then((userId) => {
      if (!userId) {
        next(new Error('unauthorized'));
        return;
      }
      socket.data.userId = userId;
      next();
    })
    .catch(() => next(new Error('unauthorized')));
});

io.on('connection', (socket) => {
  const userId = socket.data.userId as string | undefined;
  if (!userId) {
    socket.disconnect(true);
    return;
  }
  socket.join(`user_${userId}`);
});

setIo(io);

server.listen(PORT, () => {
  console.log(`Planner API: http://localhost:${PORT}`);
});

function shutdown(signal: string) {
  console.log(`${signal}: остановка сервера...`);
  io.close();
  server.close(() => {
    prisma.$disconnect().finally(() => process.exit(0));
  });
  setTimeout(() => process.exit(0), 10000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
