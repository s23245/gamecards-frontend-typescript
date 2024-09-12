import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar/Navbar';
import styles from './GameSession.module.css';

interface Hero {
    id: number;
    name: string;
    hp: number;
    mana: number;
    attack: number;
    defense: number;
    attackDamage: number;
    attackSpeed: number;
    mainElement: string;
    abilities: string;
    imageUrl: string;
}

interface GameSession {
    id: string;
    users: string[];
    heroes: Hero[];
    selectedHeroes: Record<string, number>;
    duelStarted: boolean;
    readyPlayers: string[];
}

const GameSession: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const [gameSession, setGameSession] = useState<GameSession | null>(null);
    const [, setSelectedHero] = useState<Hero | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGameSession = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const response = await axios.get(`http://localhost:8080/api/games/${gameId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setGameSession(response.data);
            } catch (error) {
                setError('Failed to load game session.');
            } finally {
                setLoading(false);
            }
        };

        const intervalId = setInterval(fetchGameSession, 100); // Poll every 0,1 seconds to refresh the session data

        return () => clearInterval(intervalId); // Clear interval on component unmount
    }, [gameId]);

    if (!gameSession || !gameSession.users || !gameSession.heroes) {
        return (
            <div className={styles.gameSessionContainer}>
                <Navbar />
                <p>There is a problem with the game session. Reload the page or find a new game session.</p>
            </div>
        );
    }

    const handleHeroSelect = async (hero: Hero) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const username = localStorage.getItem('username');
            if (!token || !username) {
                throw new Error('No token or username found');
            }
            const response = await axios.post(
                `http://localhost:8080/api/games/selectHero`,
                null,
                {
                    params: { gameId: gameId, heroId: hero.id },
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            setGameSession(response.data);
            setSelectedHero(hero);
        } catch (error) {
            setError('Failed to select hero.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoToDuel = () => {
        navigate(`/duel/${gameSession?.id}`);
    };

    const allPlayersReady = gameSession && Object.keys(gameSession.selectedHeroes).length === gameSession.users.length;

    return (
        <div className={styles.gameSessionContainer}>
            <Navbar />
            <div className={styles.gameContent}>
                <h2>Game Session {gameSession.id}</h2>
                <div className={styles.players}>
                    <h3>Players and Selected Heroes</h3>
                    {gameSession.users.map((user, index) => (
                        <p key={index}>
                            {user} {gameSession.selectedHeroes[user] && `✔ Hero: ${gameSession.heroes.find(hero => hero.id === gameSession.selectedHeroes[user])?.name}`}
                        </p>
                    ))}
                </div>
                <div className={styles.heroes}>
                    <h3>Heroes</h3>
                    <div className={styles.heroList}>
                        {gameSession.heroes.map((hero) => (
                            <div
                                key={hero.id}
                                className={`${styles.heroCard} ${gameSession.selectedHeroes[hero.id] ? styles.selectedHero : ''}`}
                                onClick={() => handleHeroSelect(hero)}
                            >
                                <img
                                    src={`/src/assets/images/${hero.imageUrl}`}
                                    alt={hero.name}
                                    className={styles.heroImage}
                                />
                                <div className={styles.heroStats}>
                                    <p><strong>{hero.name}</strong></p>
                                    <p>HP: {hero.hp}</p>
                                    <p>Mana: {hero.mana}</p>
                                    <p>Attack: {hero.attack}</p>
                                    <p>Defense: {hero.defense}</p>
                                    <p>Attack Damage: {hero.attackDamage}</p>
                                    <p>Attack Speed: {hero.attackSpeed}</p>
                                    <p>Main Element: {hero.mainElement}</p>
                                    <p>Abilities: {hero.abilities}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {error && <div className={styles.errorMessage}>{error}</div>}
                <div className={styles.duelControl}>
                    <button onClick={handleGoToDuel} disabled={!allPlayersReady}>
                        {'Go to Duel'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameSession;