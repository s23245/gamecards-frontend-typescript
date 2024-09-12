import React, { useEffect, useState } from 'react';
import { createGameSession, getActiveGames, joinGameSession } from '../services/GameService';
import Navbar from '../components/Navbar';
import styles from '../styles/FindGame.module.css';

interface GameSession {
    id: string;
    active: boolean;
    players: string[];
}

const FindGame: React.FC = () => {
    const [games, setGames] = useState<GameSession[]>([]);
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchGames = async () => {
            const activeGames = await getActiveGames();
            setGames(activeGames);
        };
        fetchGames();
    }, []);

    const handleCreateGame = async () => {
        const newGame = await createGameSession();
        setGames([...games, newGame]);
    };

    const handleJoinGame = async (gameId: string) => {
        if (!username) {
            setErrorMessage('Please enter your username');
            return;
        }
        const updatedGame = await joinGameSession(gameId, username);
        if (updatedGame) {
            setGames(games.map(game => game.id === gameId ? updatedGame : game));
        } else {
            setErrorMessage('Failed to join the game. Please try again.');
        }
    };

    return (
        <div className={styles.findGameContainer}>
            <Navbar />
            <div className={styles.findGameContent}>
                <h2>Find a Game</h2>
                <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-control mb-3"
                />
                {errorMessage && <p className="text-danger">{errorMessage}</p>}
                <button onClick={handleCreateGame} className="btn btn-success mb-3">Create Game</button>
                <h3>Active Games</h3>
                <ul className="list-group">
                    {games.map(game => (
                        <li key={game.id} className="list-group-item d-flex justify-content-between align-items-center">
                            Game ID: {game.id}
                            <button onClick={() => handleJoinGame(game.id)} className="btn btn-primary">Join Game</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default FindGame;
