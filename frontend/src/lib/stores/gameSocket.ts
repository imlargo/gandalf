import { writable } from 'svelte/store';
import { io, type Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const socketConnected = writable(false);

let socket: Socket | null = null;

export function getSocket(): Socket | null {
	return socket;
}

export function connectSocket(): Socket {
	if (socket?.connected) return socket;

	socket = io(SOCKET_URL, {
		transports: ['websocket', 'polling'],
		autoConnect: true
	});

	socket.on('connect', () => {
		socketConnected.set(true);
	});

	socket.on('disconnect', () => {
		socketConnected.set(false);
	});

	return socket;
}

export function disconnectSocket(): void {
	if (socket) {
		socket.disconnect();
		socket = null;
		socketConnected.set(false);
	}
}
