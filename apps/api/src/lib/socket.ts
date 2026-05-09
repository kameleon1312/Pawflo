import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { verifyAccessToken } from './jwt';
import { logger } from './logger';

let _io: Server | null = null;

export function createSocketServer(httpServer: HttpServer): Server {
  const origin = (process.env['CORS_ORIGIN'] ?? 'http://localhost:3000').split(',');

  const io = new Server(httpServer, {
    cors: { origin, credentials: true },
    // Prefer WebSocket, fall back to polling for restrictive networks
    transports: ['websocket', 'polling'],
  });

  // JWT auth middleware — runs before every connection
  io.use((socket, next) => {
    const token =
      (socket.handshake.auth['token'] as string | undefined) ??
      (socket.handshake.headers['authorization'] as string | undefined)?.replace('Bearer ', '');

    if (!token) return next(new Error('AUTH_MISSING'));

    try {
      const { sub } = verifyAccessToken(token);
      socket.data['userId'] = sub;
      next();
    } catch {
      next(new Error('AUTH_INVALID'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data['userId'] as string;
    logger.info({ event: 'socket.connect', userId, socketId: socket.id }, 'Socket connected');

    // Client joins a match room to receive messages
    socket.on('join_match', (matchId: string) => {
      if (typeof matchId !== 'string' || !matchId) return;
      socket.join(`match:${matchId}`);
      logger.debug({ event: 'socket.join', userId, matchId }, 'Joined match room');
    });

    socket.on('leave_match', (matchId: string) => {
      socket.leave(`match:${matchId}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info({ event: 'socket.disconnect', userId, reason }, 'Socket disconnected');
    });
  });

  _io = io;
  return io;
}

// Emit a new message to everyone in the match room except the sender's socket
export function emitNewMessage(matchId: string, message: unknown): void {
  _io?.to(`match:${matchId}`).emit('new_message', message);
}
