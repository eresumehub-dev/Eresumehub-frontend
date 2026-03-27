import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Add API Key from backend .env configuration
        config.headers['X-API-Key'] = 'EresumeHubSecretKey-12345!';
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
        if (error.response && error.response.status === 401) {
            // localStorage.removeItem('token');
            // window.location.href = '/login';
            console.warn('API 401 Error - Token might be invalid');
        }
        return Promise.reject(error);
    }
);

export default api;
