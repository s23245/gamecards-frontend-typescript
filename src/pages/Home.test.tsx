import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Home from './Home';
import { getCurrentUser, searchGame } from '../services/GameService';

vi.mock('../components/Navbar/Navbar', () => ({ default: () => <nav>Navigation</nav> }));
vi.mock('../services/GameService', () => ({ getCurrentUser: vi.fn(), searchGame: vi.fn() }));

it('uses the current authenticated identity and navigates to the matched session', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1, firstName: 'Alice', lastName: 'Player',
        email: 'alice@example.test', username: 'alice' });
    vi.mocked(searchGame).mockResolvedValue({ id: 'shared-game', users: ['alice'], heroes: [],
        selectedHeroes: {}, duelStarted: false, completed: false, phase: 'HERO_SELECTION' });
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/home']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/game-session/:gameId" element={<div>Shared session</div>} />
    </Routes></MemoryRouter>);
    expect(await screen.findByText('Welcome to GameCards, alice')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Find Game' }));
    expect(searchGame).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Shared session')).toBeInTheDocument();
});
