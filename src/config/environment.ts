const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const API_BASE_URL = stripTrailingSlash(
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
);

export const WS_BASE_URL = stripTrailingSlash(
    import.meta.env.VITE_WS_BASE_URL || API_BASE_URL,
);
