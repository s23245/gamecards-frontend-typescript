import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LoginForm from './LoginForm';
import { login } from '../services/GameService';

vi.mock('../services/GameService', () => ({ login: vi.fn() }));

const liveToken = (() => {
    const encode = (value: object) => btoa(JSON.stringify(value)).replace(/=+$/, '');
    return `${encode({ alg: 'none' })}.${encode({ sub: 'alice', exp: Math.floor(Date.now() / 1000) + 60 })}.x`;
})();

beforeEach(() => localStorage.clear());

it('stores a successful login and navigates home', async () => {
    vi.mocked(login).mockResolvedValue({ token: liveToken, username: 'alice' });
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/login']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/home" element={<div>Home screen</div>} />
    </Routes></MemoryRouter>);

    await user.type(screen.getByLabelText('Username'), 'alice');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(await screen.findByText('Home screen')).toBeInTheDocument();
    expect(localStorage.getItem('username')).toBe('alice');
});
