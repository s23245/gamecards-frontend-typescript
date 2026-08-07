import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import styles from './GameSession.module.css';
import type { GameSessionData, Hero } from '../Interfaces';
import { getErrorMessage } from '../../api/client';
import { getGameSession, selectHero } from '../../services/GameService';
import { getStoredToken, getTokenUsername } from '../../auth/token';

const GameSession = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const [game, setGame] = useState<GameSessionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selecting, setSelecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const currentUsername = useMemo(() => {
        const token = getStoredToken();
        return token ? getTokenUsername(token) : null;
    }, []);

    useEffect(() => {
        if (!gameId) {
            setError('The game URL is missing a game id.');
            setLoading(false);
            return;
        }
        let active = true;
        let timer: number | undefined;
        const poll = async () => {
            try {
                const response = await getGameSession(gameId);
                if (!active) return;
                setGame(response);
                setError(null);
                if (response.duelStarted) {
                    navigate(`/duel/${response.id}`, { replace: true });
                    return;
                }
            } catch (requestError) {
                if (active) setError(getErrorMessage(requestError, 'Unable to reach this game session.'));
            } finally {
                if (active) {
                    setLoading(false);
                    timer = window.setTimeout(poll, 1000);
                }
            }
        };
        void poll();
        return () => {
            active = false;
            if (timer) window.clearTimeout(timer);
        };
    }, [gameId, navigate]);

    const handleHeroSelect = async (hero: Hero) => {
        if (!gameId || !game || selecting || !currentUsername) return;
        const selectedBy = Object.entries(game.selectedHeroes).find(([, id]) => id === hero.id)?.[0];
        if (selectedBy && selectedBy !== currentUsername) return;
        setSelecting(true);
        setError(null);
        try {
            const response = await selectHero(gameId, hero.id);
            setGame(response);
            if (response.duelStarted) navigate(`/duel/${response.id}`, { replace: true });
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'Failed to select this hero.'));
        } finally {
            setSelecting(false);
        }
    };

    if (loading && !game) return <div className={styles.gameSessionContainer}><Navbar /><p>Loading game session…</p></div>;
    if (!game) return <div className={styles.gameSessionContainer}><Navbar /><p role="alert">{error || 'Game session not found.'}</p></div>;

    return (
        <div className={styles.gameSessionContainer}>
            <Navbar />
            <div className={styles.gameContent}>
                <h2>Game Session {game.id}</h2>
                <div className={styles.players}>
                    <h3>Players ({game.users.length}/2)</h3>
                    <ul className={styles.playerList}>
                        {game.users.map((username) => {
                            const selected = game.heroes.find((hero) => hero.id === game.selectedHeroes[username]);
                            return <li key={username} className={styles.playerItem}>
                                <span className={styles.playerName}>{username}</span>
                                {selected && <span className={styles.heroSelected}><span className={styles.checkmark}>✔</span>{selected.name}</span>}
                            </li>;
                        })}
                    </ul>
                    {game.users.length < 2 && <p>Waiting for another player to join…</p>}
                </div>
                <div className={styles.heroes}>
                    <h3>Choose your hero</h3>
                    <div className={styles.heroList}>
                        {game.heroes.map((hero) => {
                            const selectedBy = Object.entries(game.selectedHeroes).find(([, id]) => id === hero.id)?.[0];
                            const unavailable = Boolean(selectedBy && selectedBy !== currentUsername);
                            return <button type="button" key={hero.id}
                                           className={`${styles.heroCard} ${selectedBy ? styles.selectedHero : ''}`}
                                           onClick={() => void handleHeroSelect(hero)} disabled={unavailable || selecting}>
                                <img src={`/assets/images/${hero.imageUrl}`} alt={hero.name} className={styles.heroImage} />
                                <div className={styles.heroBackground}></div>
                                <div className={styles.heroStats}>
                                    <p><strong>{hero.name}</strong></p>
                                    <p>HP: {hero.hp}/{hero.maxHp}</p><p>Mana: {hero.mana}/{hero.maxMana}</p>
                                    <p>Attack: {hero.attack}</p><p>Defense: {hero.defense}</p>
                                    <p>Attack Damage: {hero.attackDamage}</p><p>Attack Speed: {hero.attackSpeed}</p>
                                    <p>Main Element: {hero.mainElement}</p>
                                    {unavailable && <p>Selected by {selectedBy}</p>}
                                </div>
                            </button>;
                        })}
                    </div>
                </div>
                {error && <div role="alert" className={styles.errorMessage}>{error}</div>}
                {Object.keys(game.selectedHeroes).length === 2 && <p>Both heroes are ready. Entering the duel…</p>}
            </div>
        </div>
    );
};

export default GameSession;
