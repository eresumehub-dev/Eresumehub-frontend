import api from './api';

export interface User {
    id: string;
    email: string;
    username: string;
    full_name: string;
}

export interface AuthResponse {
    success: boolean;
    data: {
        user: User;
        session?: {
            access_token: string;
            refresh_token?: string;
        };
        message?: string;
    };
}

export const login = async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
};

export const register = async (email: string, password: string, full_name: string, username?: string) => {
    const response = await api.post<AuthResponse>('/auth/signup', { email, password, full_name, username });
    return response.data;
};

export const getMe = async () => {
    const response = await api.get<AuthResponse>('/user/me');
    return response.data;
};
