import axios from 'axios';

const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
// The absolute URL of your Render backend
export const ABSOLUTE_BACKEND_URL = isProduction ? 'https://moralverse-1.onrender.com' : 'http://localhost:4000';
// In production, we point directly to Render to ensure media loads reliably
export const BASE_URL = isProduction ? 'https://moralverse-1.onrender.com' : 'http://localhost:4000';

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
