import { useCallback, useEffect, useRef, useState } from 'react';
import { Client, type IMessage } from '@stomp/stompjs';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import styles from './DuelStage.module.css';
import type { Card, DuelState, DuelUpdate, Hero, HeroUpdate, PlayerStatus } from '../Interfaces';
import { chooseCard, getDuelState } from '../../services/GameService';
import { getErrorMessage } from '../../api/client';
import { getStoredToken, getTokenUsername } from '../../auth/token';
import { WS_BASE_URL } from '../../config/environment';
import { phaseToStage, type Stage } from './duelState';

const DuelStage = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();
    const [playerHero, setPlayerHero] = useState<Hero | null>(null);
    const [opponentHero, setOpponentHero] = useState<Hero | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [players, setPlayers] = useState<PlayerStatus[]>([]);
    const [stage, setStage] = useState<Stage>('loading');
    const [countdown, setCountdown] = useState(5);
    const [duelLogs, setDuelLogs] = useState<string[]>([]);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const countdownTimer = useRef<number | undefined>(undefined);
    const gameOver = useRef(false);

    const applyState = useCallback((state: DuelState) => {
        setError('');
        gameOver.current = state.gameOver;
        setPlayerHero(state.playerHero);
        setOpponentHero(state.opponentHero);
        setCards(state.cards || []);
        setPlayers(state.players || []);
        setSelectedCard(state.cards?.find((card) => card.id === state.selectedCardId) || null);
        if (state.result) setResult(state.result);
        setStage(phaseToStage(state));
    }, []);

    const recover = useCallback(async () => {
        if (!gameId) throw new Error('The duel URL is missing a game id.');
        applyState(await getDuelState(gameId));
    }, [applyState, gameId]);

    const beginCountdown = useCallback((seconds: number) => {
        if (countdownTimer.current) window.clearInterval(countdownTimer.current);
        setCountdown(seconds);
        setStage('countdown');
        countdownTimer.current = window.setInterval(() => {
            setCountdown((current) => {
                if (current <= 1) {
                    if (countdownTimer.current) window.clearInterval(countdownTimer.current);
                    return 0;
                }
                return current - 1;
            });
        }, 1000);
    }, []);

    useEffect(() => {
        const token = getStoredToken();
        const username = token ? getTokenUsername(token) : null;
        if (!token || !username || !gameId) {
            setError('This duel cannot be opened without a valid session and game id.');
            setStage('error');
            return;
        }
        let active = true;
        void recover().catch((requestError) => {
            if (active) {
                setError(getErrorMessage(requestError, 'Unable to recover the current duel state.'));
                setStage('error');
            }
        });

        const parse = <T,>(message: IMessage): T => JSON.parse(message.body) as T;
        const client = new Client({
            brokerURL: `${WS_BASE_URL.replace(/^http/, 'ws')}/ws/websocket`,
            connectHeaders: { Authorization: `Bearer ${token}` },
            debug: import.meta.env.DEV ? (message) => console.debug(`[STOMP] ${message}`) : () => undefined,
            reconnectDelay: 3000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            onConnect: () => {
                if (!active) return;
                client.subscribe(`/topic/hero-stats/${gameId}/${username}`, (message) => {
                    if (gameOver.current) return;
                    const update = parse<HeroUpdate>(message);
                    setPlayerHero(update.hero);
                });
                client.subscribe(`/topic/cards/${gameId}/${username}`, (message) => {
                    if (gameOver.current) return;
                    const nextCards = parse<Card[]>(message);
                    setCards(nextCards);
                    setError('');
                    setSelectedCard(null);
                    setSubmitting(false);
                    setDuelLogs([]);
                    setStage('base');
                });
                client.subscribe(`/topic/countdown/${gameId}`, (message) => beginCountdown(Number.parseInt(message.body, 10) || 5));
                client.subscribe(`/topic/duel-progress/${gameId}`, (message) => {
                    if (gameOver.current) return;
                    const update = parse<DuelUpdate>(message);
                    setDuelLogs((logs) => [...logs, ...update.logs]);
                    if (update.user1 === username) {
                        setPlayerHero(update.hero1); setOpponentHero(update.hero2);
                    } else {
                        setPlayerHero(update.hero2); setOpponentHero(update.hero1);
                    }
                    setStage('duel');
                });
                client.subscribe(`/topic/duel-result/${gameId}`, (message) => {
                    if (gameOver.current) return;
                    setResult(message.body); setStage('post-duel');
                });
                client.subscribe(`/topic/game-over/${gameId}`, (message) => {
                    gameOver.current = true;
                    if (countdownTimer.current) window.clearInterval(countdownTimer.current);
                    setResult(message.body); setStage('game-over');
                });
                client.subscribe(`/topic/players-status/${gameId}`, (message) => setPlayers(parse<PlayerStatus[]>(message)));
                client.subscribe(`/topic/game-error/${gameId}`, (message) => { setError(message.body); setStage('error'); });
                void recover().then(() => {
                    if (active) client.publish({ destination: '/app/player-ready', body: JSON.stringify({ gameId }) });
                }).catch((requestError) => {
                    setError(getErrorMessage(requestError, 'Unable to synchronize the duel.'));
                    setStage('error');
                });
            },
            onWebSocketClose: () => {
                if (active && !gameOver.current) setStage('reconnecting');
            },
            onWebSocketError: (event) => {
                if (import.meta.env.DEV) console.error('WebSocket transport error', event);
            },
            onStompError: (frame) => {
                if (active) {
                    setError(frame.headers.message || 'The game server rejected the WebSocket connection.');
                    setStage('error');
                }
            },
        });
        client.activate();
        return () => {
            active = false;
            if (countdownTimer.current) window.clearInterval(countdownTimer.current);
            void client.deactivate();
        };
    }, [beginCountdown, gameId, recover]);

    const submitCard = async () => {
        if (!gameId || !selectedCard || submitting || stage !== 'base') return;
        setSubmitting(true);
        setError('');
        try {
            await chooseCard(gameId, selectedCard.id);
            setStage('waiting');
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'Failed to submit this card.'));
            setSubmitting(false);
        }
    };

    const imageUrl = (name?: string) => `/assets/images/${name || 'background/card_back1.png'}`;
    const barWidth = (current: number, maximum: number) => `${maximum > 0 ? Math.max(0, Math.min(100, current / maximum * 100)) : 0}%`;
    const renderHero = (hero: Hero, className: string) => <div className={className}>
        <img src={imageUrl(hero.imageUrl)} alt={hero.name} className={styles.heroImage} />
        <div className={styles.heroStats}><p><strong>{hero.name}</strong></p>
            <div className={styles.statBar}><span>HP:</span><div className={styles.progressBar}>
                <div className={styles.progress} style={{ width: barWidth(hero.hp, hero.maxHp), backgroundColor: 'green' }} />
            </div><span>{hero.hp}/{hero.maxHp}</span></div>
            <div className={styles.statBar}><span>Mana:</span><div className={styles.progressBar}>
                <div className={styles.progress} style={{ width: barWidth(hero.mana, hero.maxMana), backgroundColor: 'blue' }} />
            </div><span>{hero.mana}/{hero.maxMana}</span></div>
            <p>Attack: {hero.attack}</p><p>Defense: {hero.defense}</p><p>Attack Damage: {hero.attackDamage}</p>
        </div>
    </div>;

    return <div className={styles.duelContainer}>
        <Navbar />
        <div className={styles.duelContent}>
            <div className={styles.playersTable}><h3>Players</h3><ul>
                {players.map((player) => <li key={player.username}>{player.username}: {player.hp} HP</li>)}
            </ul></div>
            {error && <p role="alert" className="text-danger">{error}</p>}
            {stage === 'loading' && <p>Loading the current duel…</p>}
            {stage === 'reconnecting' && <p>Connection lost. Reconnecting and recovering game state…</p>}
            {stage === 'error' && <div><p>The duel is paused because of an error.</p><button onClick={() => {
                setStage('loading');
                void recover().catch((requestError) => {
                    setError(getErrorMessage(requestError, 'Unable to synchronize the duel.'));
                    setStage('error');
                });
            }}>Retry</button></div>}
            {stage === 'base' && playerHero && <div className={styles.baseStage}>
                <div className={styles.heroContainer}>{renderHero(playerHero, styles.hero1)}</div>
                <h2>Choose a Card</h2>
                <div className={styles.cardSelection}>{cards.map((card) => <button type="button" key={card.id}
                    className={`${styles.card} ${selectedCard?.id === card.id ? styles.selectedCard : ''} ${styles[card.rarity.toLowerCase()] || ''}`}
                    onClick={() => setSelectedCard(card)} disabled={submitting}>
                    {selectedCard?.id === card.id && <div className={styles.cardSelectedOverlay}>Selected</div>}
                    <img src={imageUrl(card.imageUrl)} alt={card.name} className={styles.cardImage} />
                    <div className={styles.cardInfo}><h3>{card.name}</h3><p>{card.description}</p>
                        {Object.entries(card.attributes).map(([key, value]) => <p key={key}>{key}: {value > 0 ? '+' : ''}{value}</p>)}
                    </div>
                </button>)}</div>
                {cards.length === 0 && <p>Waiting for the server to deal cards…</p>}
                <button onClick={() => void submitCard()} disabled={!selectedCard || submitting} className={styles.submitButton}>
                    {submitting ? 'Submitting…' : 'Confirm Selection'}
                </button>
            </div>}
            {stage === 'waiting' && <div className={styles.waitingMessage}>Card locked in. Waiting for the other player…</div>}
            {stage === 'countdown' && <div className={styles.countdownTimer}>Duel starts in: {countdown}</div>}
            {stage === 'duel' && playerHero && opponentHero && <div className={styles.duelStage}>
                {renderHero(playerHero, styles.hero1)}{renderHero(opponentHero, styles.hero2)}
                <div className={styles.duelLogs}>{duelLogs.map((log, index) => <p key={`${index}-${log}`}>{log}</p>)}</div>
            </div>}
            {stage === 'post-duel' && <div className={styles.duelResult}><p>{result}</p><p>Preparing the next card round…</p></div>}
            {stage === 'game-over' && <div className={styles.gameOver}><p>{result || 'Game Over'}</p>
                <button onClick={() => navigate('/home', { replace: true })} className={styles.backToLobbyButton}>Back to Home</button>
            </div>}
        </div>
    </div>;
};

export default DuelStage;
