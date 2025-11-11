import { io } from 'socket.io-client';

let socket: ReturnType<typeof io> | null = null;

export function initSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_WS ?? 'http://localhost:5001', {
      transports: ['websocket']
    });
  }
  return socket;
}

export function getSocket() {
  return socket;
}