import axios from 'axios';

const isProduction = window.location.hostname !== 'localhost';
// The absolute URL of your Render backend
export const ABSOLUTE_BACKEND_URL = isProduction ? 'https://moral-verse.onrender.com' : 'http://localhost:4000';
// In production, we use relative paths so Vercel can proxy them to our Render backend
export const BASE_URL = isProduction ? '' : 'http://localhost:4000';

const API = axios.create({
    baseURL: isProduction ? '/api' : 'http://localhost:4000/api',
});

API.interceptors.request.use((req) => {
    if (localStorage.getItem('token')) {
        req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    }
    return req;
});

export default API;
