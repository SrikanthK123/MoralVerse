import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

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
