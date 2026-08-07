interface JwtPayload {
    sub?: string;
    exp?: number;
}

export const TOKEN_KEY = 'token';
export const USERNAME_KEY = 'username';

export const decodeToken = (token: string): JwtPayload | null => {
    try {
        const encoded = token.split('.')[1];
        if (!encoded) return null;
        const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
        return JSON.parse(atob(padded)) as JwtPayload;
    } catch {
        return null;
    }
};

export const isTokenUsable = (token: string | null): token is string => {
    if (!token) return false;
    const payload = decodeToken(token);
    return Boolean(payload?.sub && payload.exp && payload.exp * 1000 > Date.now());
};

export const getStoredToken = (): string | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!isTokenUsable(token)) {
        clearAuth();
        return null;
    }
    return token;
};

export const storeAuth = (token: string, username: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USERNAME_KEY, username);
};

export const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
};

export const getTokenUsername = (token: string): string | null => decodeToken(token)?.sub ?? null;
