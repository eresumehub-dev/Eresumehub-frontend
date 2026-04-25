import axios from 'axios';
import { supabase } from './supabase';

const getBaseURL = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (!envUrl) return '/api/v1';
    // Ensure no trailing slash and append /api/v1
    return `${envUrl.replace(/\/$/, '')}/api/v1`;
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
    async (config) => {
        // Fetch session from Supabase SDK instead of localStorage (v16.5.0 Hardening)
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Emit a custom event to handle multi-request 401s without flickering
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        return Promise.reject(error);
    }
);

export default api;
