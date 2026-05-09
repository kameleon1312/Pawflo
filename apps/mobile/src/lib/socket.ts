import { io, type Socket } from 'socket.io-client';
import { tokenStorage } from './secureStorage';

const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:3001';

let _socket: Socket | null = null;

export async function getSocket(): Promise<Socket> {
  if (_socket?.connected) return _socket;

  const token = await tokenStorage.getAccessToken();

  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }

  _socket = io(API_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return _socket;
}

export function disconnectSocket(): void {
  _socket?.disconnect();
  _socket = null;
}
