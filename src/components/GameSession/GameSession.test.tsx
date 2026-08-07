import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import GameSession from './GameSession';
import { getGameSession } from '../../services/GameService';

vi.mock('../Navbar/Navbar', () => ({ default: () => <nav>Navigation</nav> }));
vi.mock('../../auth/token', () => ({ getStoredToken: () => 'token', getTokenUsername: () => 'alice' }));
vi.mock('../../services/GameService', () => ({ getGameSession: vi.fn(), selectHero: vi.fn() }));

it('fetches immediately and automatically enters a server-started duel', async () => {
    vi.mocked(getGameSession).mockResolvedValue({ id: 'game-ready', users: ['alice', 'bob'], heroes: [],
        selectedHeroes: { alice: 1, bob: 2 }, duelStarted: true, completed: false, phase: 'WAITING_FOR_PLAYERS' });
    render(<MemoryRouter initialEntries={['/game-session/game-ready']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Routes>
        <Route path="/game-session/:gameId" element={<GameSession />} />
        <Route path="/duel/:gameId" element={<div>Duel destination</div>} />
    </Routes></MemoryRouter>);
    expect(screen.getByText('Loading game session…')).toBeInTheDocument();
    expect(await screen.findByText('Duel destination')).toBeInTheDocument();
    expect(getGameSession).toHaveBeenCalledWith('game-ready');
});
