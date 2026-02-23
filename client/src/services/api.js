import axios from 'axios';

const isProduction = window.location.hostname !== 'localhost';
export const BASE_URL = isProduction ? 'https://moralverse.onrender.com' : 'http://localhost:4000';

const API = axios.create({
    baseURL: `${BASE_URL}/api`,
});

API.interceptors.request.use((req) => {
    if (localStorage.getItem('token')) {
        req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    }
    return req;
});

export default API;
