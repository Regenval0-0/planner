import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import { initMailer } from './mailer.js';
import { JWT_SECRET } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';

// Инициализация почтового сервиса
initMailer().catch(() => { /* mailer optional */ });

// CORS: dev + production (GitHub Pages, local Electron, etc.)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3001',
  'https://*.github.io',
  'https://*.onrender.com',
];

if (isDev) {
  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
  }));
} else {
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.some(o => {
        if (o.includes('*')) {
          const regex = new RegExp(o.replace(/\*/g, '.*'));
          return regex.test(origin);
        }
        return o === origin;
      })) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));
}

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Serve frontend static files in production
const possibleDistPaths = [
  path.join(__dirname),
  path.join(__dirname, '../../../frontend/planner/dist'),
  path.join(__dirname, '../../../../../dist'),
  path.join(__dirname, '../../dist'),
  path.join(process.cwd(), 'dist'),
];

let distPath: string | null = null;
for (const p of possibleDistPaths) {
  if (fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))) {
    distPath = p;
    break;
  }
}

if (distPath) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath!, 'index.html'));
  });
  console.log(`Serving frontend from ${distPath}`);
} else if (!isDev) {
  console.warn('Frontend dist not found in any known location');
}

// Socket.IO for real-time sync
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    (socket as any).userId = decoded.userId;
    next();
  } catch {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const userId = (socket as any).userId;
  if (!userId) return;

  socket.join(`user_${userId}`);
  console.log(`Socket joined room user_${userId}`);

  socket.on('disconnect', () => {
    console.log(`Socket left room user_${userId}`);
  });
});

// Export io for use in event routes
export { io };

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
