import axios from 'axios';

// Fallback to local IP if not on Render or Vercel
const isProduction = window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    (window.location.hostname.includes('onrender.com') || window.location.hostname.includes('vercel.app'));

const localBackendBase = `http://${window.location.hostname}:4000`;

export const ABSOLUTE_BACKEND_URL = isProduction ? 'https://moralverse.onrender.com' : localBackendBase;
export const BASE_URL = isProduction ? 'https://moralverse.onrender.com' : localBackendBase;

const API = axios.create({
    baseURL: isProduction ? 'https://moralverse.onrender.com/api' : `${localBackendBase}/api`,
});

API.interceptors.request.use((req) => {
    if (localStorage.getItem('token')) {
        req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    }
    return req;
});

export const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${BASE_URL}/${cleanPath}`;
};

export default API;
