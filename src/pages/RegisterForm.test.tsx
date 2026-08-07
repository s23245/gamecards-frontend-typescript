import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RegisterForm from './RegisterForm';
import { register } from '../services/GameService';

vi.mock('../services/GameService', () => ({ register: vi.fn() }));

beforeEach(() => vi.mocked(register).mockReset());

it('submits the explicit username contract and navigates to login', async () => {
    vi.mocked(register).mockResolvedValue({ id: 1, firstName: 'Alice', lastName: 'Player',
        email: 'alice@example.test', username: 'alice_player' });
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/register']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Routes>
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<div>Login destination</div>} />
    </Routes></MemoryRouter>);
    await user.type(screen.getByLabelText('First name'), 'Alice');
    await user.type(screen.getByLabelText('Last name'), 'Player');
    await user.type(screen.getByLabelText('Email'), 'alice@example.test');
    await user.type(screen.getByLabelText('Username'), 'alice_player');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Register' }));
    expect(register).toHaveBeenCalledWith({ firstName: 'Alice', lastName: 'Player',
        email: 'alice@example.test', username: 'alice_player', password: 'password123' });
    expect(await screen.findByText('Login destination')).toBeInTheDocument();
});
