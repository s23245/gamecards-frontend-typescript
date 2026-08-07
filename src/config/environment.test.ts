import { API_BASE_URL, WS_BASE_URL } from './environment';

it('uses the documented local backend defaults', () => {
    expect(API_BASE_URL).toBe('http://localhost:8080');
    expect(WS_BASE_URL).toBe('http://localhost:8080');
});
