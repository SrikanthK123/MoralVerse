import { io } from 'socket.io-client';
import { BASE_URL } from './api';

const SOCKET_URL = BASE_URL;

export const socket = io(SOCKET_URL, {
    autoConnect: true,
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
