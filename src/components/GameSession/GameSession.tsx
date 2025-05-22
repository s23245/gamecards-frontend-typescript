import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar/Navbar';
import styles from './GameSession.module.css';
import {BASE_URL} from "../../services/GameService";

interface  Skill
{
    id: number;
    name: string;
    manaCost: number;
    damage: number;
    cooldown: number;
    lastUsedRound: number;
}

interface Hero {
    id: number;
    name: string;
    hp: number;
    mana: number;
    attack: number;
    defense: number;
    attack_damage: number;
    attack_speed: number;
    main_element: string;
    image_url: string;
    skills: Skill[];
}

interface GameSession {
    id: string;
    users: string[];
    heroes: Hero[];
    selectedHeroes: Record<string, number>;
    duelStarted: boolean;
}

const GameSession: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const [gameSession, setGameSession] = useState<GameSession | null>(null);
    const [, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (gameSession && gameSession.duelStarted) {
            navigate(`/duel/${gameSession.id}`);
        }
    }, [gameSession, navigate]);

    useEffect(() => {
        const fetchGameSession = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const response = await axios.get(`${BASE_URL}/api/games/${gameId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setGameSession(response.data);
            } catch (error) {
                console.error('Error fetching game session:', error);
                setError('Failed to load game session.');
            } finally {
                setLoading(false);
            }
        };

        const intervalId = setInterval(fetchGameSession, 1000); // Poll every 1 second

        return () => clearInterval(intervalId);
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
            if (!token) {
                throw new Error('No token found');
            }
            const response = await axios.post(
                `${BASE_URL}/api/games/selectHero`,
                null,
                {
                    params: { gameId: gameSession.id, heroId: hero.id },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setGameSession(response.data);
        } catch (error) {
            console.error('Error selecting hero:', error);
            setError('Failed to select hero.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoToDuel = async () => {
        if (!gameSession) return;
        // Navigate to duel page
        navigate(`/duel/${gameSession.id}`);
    };

    const allPlayersReady = gameSession && Object.keys(gameSession.selectedHeroes).length === gameSession.users.length;

    return (
        <div className={styles.gameSessionContainer}>
            <Navbar />
            <div className={styles.gameContent}>
                <h2>Game Session {gameSession.id}</h2>
                <div className={styles.players}>
                    <h3>Players</h3>
                    <ul className={styles.playerList}>
                        {gameSession.users.map((username, index) => {
                            const heroId = gameSession.selectedHeroes[username];
                            const heroName = heroId
                                ? gameSession.heroes.find((hero) => hero.id === heroId)?.name
                                : null;
                            return (
                                <li key={index} className={styles.playerItem}>
                                    <span className={styles.playerName}>{username}</span>
                                    {heroName && (
                                        <span className={styles.heroSelected}>
                                            <span className={styles.checkmark}>✔</span>{heroName}
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className={styles.heroes}>
                    <h3>Heroes</h3>
                    <div className={styles.heroList}>
                        {gameSession.heroes.map((hero) => {
                            const isHeroSelected = Object.values(gameSession.selectedHeroes).includes(hero.id);
                            console.log("Hero", hero);
                            return (
                                <div
                                    key={hero.id}
                                    className={`${styles.heroCard} ${isHeroSelected ? styles.selectedHero : ''}`}
                                    onClick={() => handleHeroSelect(hero)}
                                >

                                    <img
                                        src={`/assets/images/${hero.image_url}`}
                                        alt={hero.name}
                                        className={styles.heroImage}
                                    />
                                    <div className={styles.heroBackground}></div> {/* Adding background behind the hero */}
                                    <div className={styles.heroStats}>
                                        <p>
                                            <strong>{hero.name}</strong>
                                        </p>
                                        <p>HP: {hero.hp}</p>
                                        <p>Mana: {hero.mana}</p>
                                        <p>Attack: {hero.attack}</p>
                                        <p>Defense: {hero.defense}</p>
                                        <p>Attack Damage: {hero.attack_damage}</p>
                                        <p>Attack Speed: {hero.attack_speed}</p>
                                        <p>Main Element: {hero.main_element}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {error && <div className={styles.errorMessage}>{error}</div>}
                <div className={styles.duelControl}>
                    <button onClick={handleGoToDuel} disabled={!allPlayersReady}>
                        Go to Duel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameSession;