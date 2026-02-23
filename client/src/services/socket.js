import { io } from 'socket.io-client';
import { ABSOLUTE_BACKEND_URL } from './api';

const SOCKET_URL = ABSOLUTE_BACKEND_URL;

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    transports: ['websocket', 'polling']
});

socket.on('connect', () => {
    console.log('✅ Connected to server socket:', socket.id);
});

socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error.message);
});

socket.on('disconnect', (reason) => {
    console.log('❌ Disconnected from server:', reason);
});

export default socket;
