import { clearAuth, decodeToken, getStoredToken, isTokenUsable, storeAuth } from './token';

const token = (payload: object) => {
    const encode = (value: object) => btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return `${encode({ alg: 'none' })}.${encode(payload)}.signature`;
};

describe('JWT storage', () => {
    beforeEach(clearAuth);

    it('decodes base64url claims and restores a live token', () => {
        const live = token({ sub: 'alice_test', exp: Math.floor(Date.now() / 1000) + 60 });
        storeAuth(live, 'alice_test');
        expect(decodeToken(live)?.sub).toBe('alice_test');
        expect(isTokenUsable(live)).toBe(true);
        expect(getStoredToken()).toBe(live);
    });

    it('clears expired and malformed tokens', () => {
        const expired = token({ sub: 'alice', exp: 1 });
        storeAuth(expired, 'alice');
        expect(getStoredToken()).toBeNull();
        expect(localStorage.getItem('username')).toBeNull();
        expect(isTokenUsable('not-a-token')).toBe(false);
    });
});
