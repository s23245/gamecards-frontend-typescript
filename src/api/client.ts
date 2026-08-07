import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '../config/environment';
import { clearAuth, getStoredToken } from '../auth/token';

export interface ApiErrorBody {
    message?: string;
    fieldErrors?: Record<string, string>;
}

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorBody>) => {
        if (error.response?.status === 401) {
            clearAuth();
            if (!window.location.pathname.startsWith('/login')) window.location.assign('/login');
        }
        return Promise.reject(error);
    },
);

export const getErrorMessage = (error: unknown, fallback: string): string => {
    if (!axios.isAxiosError<ApiErrorBody>(error)) return fallback;
    const fields = error.response?.data?.fieldErrors;
    if (fields && Object.keys(fields).length > 0) return Object.values(fields).join('. ');
    return error.response?.data?.message || fallback;
};
