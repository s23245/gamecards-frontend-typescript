import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getStoredToken } from '../auth/token';

export const ProtectedRoute = ({ children }: { children: ReactElement }) => {
    const location = useLocation();
    return getStoredToken()
        ? children
        : <Navigate to="/login" replace state={{ from: location.pathname }} />;
};

export const GuestRoute = ({ children }: { children: ReactElement }) =>
    getStoredToken() ? <Navigate to="/home" replace /> : children;
