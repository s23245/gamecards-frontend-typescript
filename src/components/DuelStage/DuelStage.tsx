import React, { useEffect, useState, useRef } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Navbar from '../Navbar/Navbar';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './DuelStage.module.css';

import { Hero, Card, DuelUpdate, PlayerStatus, HeroUpdate } from '../Interfaces';
import {BASE_URL} from "../../services/GameService";

const DuelStage: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const [playerHero, setPlayerHero] = useState<Hero | null>(null);
    const [opponentHero, setOpponentHero] = useState<Hero | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [duelResult, setDuelResult] = useState<string>('');
    const [duelStageState, setDuelStageState] = useState<'base' | 'waiting' | 'countdown' | 'duel' | 'post-duel' | 'game-over'>('base');
    const [currentUserName, setCurrentUserName] = useState<string | null>(null);
    const [countdown, setCountdown] = useState<number>(5);
    const [duelLogs, setDuelLogs] = useState<string[]>([]);
    const stompClientRef = useRef<Client | null>(null);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [playersStatus, setPlayersStatus] = useState<PlayerStatus[]>([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Authorization token is missing.');
            return;
        }

        const userName = getUserNameFromToken(token);
        setCurrentUserName(userName);

        const socketUrl = `${BASE_URL}/ws?token=${encodeURIComponent(token)}`;
        const stompClient = new Client({
            webSocketFactory: () => new SockJS(socketUrl),
            debug: (str) => {
                console.log('STOMP Debug:', str);
            },
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('WebSocket Connected');

                // Send player-ready message
                stompClient.publish({
                    destination: '/app/player-ready',
                    body: JSON.stringify({ gameId, username: currentUserName }),
                });

                // Subscribe to hero stats
                stompClient.subscribe(`/topic/hero-stats/${gameId}/${userName}`, (message: IMessage) => {
                    try {
                        console.log('Received hero stats message:', message.body);
                        const heroUpdate: HeroUpdate = JSON.parse(message.body);
                        console.log('Parsed heroUpdate:', heroUpdate);
                        console.log('Hero stats:', heroUpdate.hero);
                        setPlayerHero(heroUpdate.hero);
                    } catch (e) {
                        console.error('Error parsing hero stats:', e, 'Message body:', message.body);
                    }
                });

                // Subscribe to cards
                stompClient.subscribe(`/topic/cards/${gameId}/${userName}`, (message: IMessage) => {
                    try {
                        const receivedCards: Card[] = JSON.parse(message.body);
                        console.log('Hero cards:', receivedCards);
                        setCards(receivedCards);
                        setDuelStageState('base');
                    } catch (e) {
                        console.error('Error parsing cards:', e, 'Message body:', message.body);
                    }
                });

                // Subscribe to countdown
                stompClient.subscribe(`/topic/countdown/${gameId}`, (message: IMessage) => {
                    try {
                        const countdownValue = parseInt(message.body, 10);
                        setCountdown(countdownValue);
                        setDuelStageState('countdown');
                        startCountdown();
                    }
                    catch (e) {
                        console.error('Error countdown:', e, 'Message body:', message.body);
                    }
                });

                // Subscribe to duel progress
                stompClient.subscribe(`/topic/duel-progress/${gameId}`, (message: IMessage) => {
                    const duelUpdate: DuelUpdate = JSON.parse(message.body);

                    // Append new logs
                    setDuelLogs((prevLogs) => [...prevLogs, ...duelUpdate.logs]);

                    if (currentUserName === duelUpdate.user1) {
                        setPlayerHero(duelUpdate.hero1);
                        setOpponentHero(duelUpdate.hero2);
                    } else {
                        setPlayerHero(duelUpdate.hero2);
                        setOpponentHero(duelUpdate.hero1);
                    }

                    setDuelStageState('duel');
                });

                // Subscribe to duel result
                stompClient.subscribe(`/topic/duel-result/${gameId}`, (message: IMessage) => {
                    setDuelResult(message.body);
                    setDuelStageState('post-duel');
                });

                // Subscribe to game over
                stompClient.subscribe(`/topic/game-over/${gameId}`, (message: IMessage) => {
                    setDuelResult(message.body);
                    setDuelStageState('game-over');
                });

                // Subscribe to players' status
                stompClient.subscribe(`/topic/players-status/${gameId}`, (message: IMessage) => {
                    const receivedPlayersStatus: PlayerStatus[] = JSON.parse(message.body);
                    setPlayersStatus(receivedPlayersStatus);
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
            onDisconnect: () => {
                console.log('WebSocket Disconnected');
            },
        });

        stompClient.activate();

        stompClientRef.current = stompClient;

        return () => {
            if (stompClientRef.current) {
                if (stompClientRef.current instanceof Client) {
                    stompClientRef.current.deactivate();
                }
            }
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
            }
        };

    }, [currentUserName, gameId]);

    const getUserNameFromToken = (token: string): string | null => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.sub;
        } catch (error) {
            console.error('Failed to parse token:', error);
            return null;
        }
    };

    const handleCardSelect = (card: Card) => {
        setSelectedCard(card);
    };

    const submitSelectedCard = async () => {
        if (!selectedCard) return;

        try {
            console.log('Submitting selected card:', selectedCard);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authorization token is missing.');
            }

            await axios.post(
                `${BASE_URL}/api/duel/choose-card`,
                { cardId: selectedCard.id, gameId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('Card selection submitted successfully.');

            // Set the state to 'waiting' after submitting the card
            setDuelStageState('waiting');
        } catch (error: any) {
            console.error('Failed to submit selected card:', error);
        }
    };

    const startCountdown = () => {
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
        }

        countdownIntervalRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownIntervalRef.current!);
                    setDuelStageState('duel');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const getImageUrl = (imageName: string) => `/assets/images/${imageName}`;

    // Helper function to calculate modified hero stats
    const getModifiedHeroStats = (): Hero | null => {
        if (!playerHero) return null;

        // Create a copy of the player's hero stats
        const modifiedHero: Hero = { ...playerHero };

        // If a card is selected and has attributes, apply them to the hero's stats
        if (selectedCard && selectedCard.attributes) {
            Object.entries(selectedCard.attributes).forEach(([key, value]) => {
                if (key in modifiedHero && typeof (modifiedHero as any)[key] === 'number') {
                    (modifiedHero as any)[key] += value as number;
                }
            });
        }

        return modifiedHero;
    };

    // Helper function to render stats with changes
    const renderStat = (statName: string, baseValue: number, modifiedValue: number) => {
        if (modifiedValue !== baseValue) {
            const diff = modifiedValue - baseValue;
            return (
                <p className={styles.statDiff}>{statName}: {baseValue} {diff > 0 ? <strong>+{diff}</strong> : diff}</p>
            );
        } else {
            return (
                <p>{statName}: {baseValue}</p>
            );
        }
    };

    // Get the modified hero stats
    const modifiedHero = getModifiedHeroStats();

    return (
        <div className={styles.duelContainer}>
            <Navbar />
            <div className={styles.duelContent}>
                {/* Display players' table */}
                <div className={styles.playersTable}>
                    <h3>Players</h3>
                    <ul>
                        {playersStatus.map((ps) => (
                            <li key={ps.username}>
                                {ps.username}: {ps.hp} HP
                            </li>
                        ))}
                    </ul>
                </div>

                {duelStageState === 'base' && playerHero && (
                    <div className={styles.baseStage}>
                        <div className={styles.heroContainer}>
                            <div className={styles.heroImageWrapper}>
                                <img src={getImageUrl(playerHero.imageUrl)} alt={playerHero.name} className={styles.heroImage} />
                            </div>

                            <div className={styles.heroStats}>
                                <p><strong>{playerHero.name}</strong></p>
                                <div className={styles.statBar}>
                                    <span>HP:</span>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={styles.progress}
                                            style={{ width: `${(playerHero.hp / playerHero.maxHp) * 100}%`, backgroundColor: 'green' }}
                                        ></div>
                                    </div>
                                    <span>{playerHero.hp}/{playerHero.maxHp}</span>
                                </div>
                                <div className={styles.statBar}>
                                    <span>Mana:</span>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={styles.progress}
                                            style={{ width: `${(playerHero.mana / playerHero.maxMana) * 100}%`, backgroundColor: 'blue' }}
                                        ></div>
                                    </div>
                                    <span>{playerHero.mana}/{playerHero.maxMana}</span>
                                </div>

                                {/* Use renderStat to display stats with changes */}
                                {modifiedHero && renderStat('Attack', playerHero.attack, modifiedHero.attack)}
                                {modifiedHero && renderStat('Defense', playerHero.defense, modifiedHero.defense)}
                                {modifiedHero && renderStat('Attack Damage', playerHero.attackDamage, modifiedHero.attackDamage)}
                                {modifiedHero && renderStat('Attack Speed', playerHero.attackSpeed, modifiedHero.attackSpeed)}
                                {modifiedHero && renderStat('Max HP', playerHero.maxHp, modifiedHero.maxHp)}
                                {modifiedHero && renderStat('Max Mana', playerHero.maxMana, modifiedHero.maxMana)}
                                {/* Add more stats as needed */}

                                <p>
                                    Main Element: <span className={`${styles.element} ${styles[playerHero.mainElement.toLowerCase()]}`}>{playerHero.mainElement}</span>
                                </p>
                            </div>
                        </div>
                        <h2>Choose a Card</h2>
                        <div className={styles.cardSelection}>
                            {cards.map((card) => (
                                <div
                                    key={card.id}
                                    className={`${styles.card} ${selectedCard?.id === card.id ? styles.selectedCard : ''} ${styles[card.rarity.toLowerCase()]}`}
                                    onClick={() => handleCardSelect(card)}
                                >
                                    {selectedCard?.id === card.id && (
                                        <div className={styles.cardSelectedOverlay}>Selected</div>
                                    )}
                                    <img src={getImageUrl(card.imageUrl)} alt={card.name} className={styles.cardImage} />
                                    <div className={styles.cardInfo}>
                                        <h3>{card.name}</h3>
                                        <p>{card.description}</p>
                                        {/* Display attributes */}
                                        {card.attributes && (
                                            <div>
                                                {Object.entries(card.attributes).map(([key, value]) => (
                                                    <p key={key}>
                                                        {key}: {value}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                        {/* Display skills */}
                                        {card.skills && card.skills.length > 0 && (
                                            <div>
                                                <h4>Skills:</h4>
                                                {card.skills.map((skill, index) => (
                                                    <div key={`${card.id}-skill-${index}`}>
                                                        <p>Name: {skill.name}</p>
                                                        <p>Type: {skill.type}</p>
                                                        <p>Effect: {skill.effect}</p>
                                                        <p>Value: {skill.value}</p>
                                                        {skill.manaCost > 0 && <p>Mana Cost: {skill.manaCost}</p>}
                                                        {skill.cooldown > 0 && <p>Cooldown: {skill.cooldown}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={submitSelectedCard} disabled={!selectedCard} className={styles.submitButton}>
                            Confirm Selection
                        </button>
                    </div>
                )}

                {duelStageState === 'waiting' && (
                    <div className={styles.waitingMessage}>
                        Waiting for other players to select their cards...
                    </div>
                )}

                {duelStageState === 'countdown' && (
                    <div className={styles.countdownTimer}>
                        Duel starts in: {countdown} seconds
                    </div>
                )}

                {duelStageState === 'duel' && playerHero && opponentHero && (
                    <div className={styles.duelStage}>
                        {/* Player's Hero */}
                        <div className={styles.hero1}>
                            <img
                                src={getImageUrl(playerHero.imageUrl)}
                                alt={playerHero.name}
                                className={styles.heroImage}
                            />
                            <div className={styles.heroStats}>
                                <p><strong>{playerHero.name}</strong></p>
                                <div className={styles.statBar}>
                                    <span>HP:</span>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={styles.progress}
                                            style={{ width: `${(playerHero.hp / playerHero.maxHp) * 100}%`, backgroundColor: 'green' }}
                                        ></div>
                                    </div>
                                    <span>{playerHero.hp}/{playerHero.maxHp}</span>
                                </div>
                                <div className={styles.statBar}>
                                    <span>Mana:</span>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={styles.progress}
                                            style={{ width: `${(playerHero.mana / playerHero.maxMana) * 100}%`, backgroundColor: 'blue' }}
                                        ></div>
                                    </div>
                                    <span>{playerHero.mana}/{playerHero.maxMana}</span>
                                </div>
                            </div>
                        </div>
                        {/* Opponent's Hero */}
                        <div className={styles.hero2}>
                            <img
                                src={getImageUrl(opponentHero.imageUrl)}
                                alt={opponentHero.name}
                                className={styles.heroImage}
                            />
                            <div className={styles.heroStats}>
                                <p><strong>{opponentHero.name}</strong></p>
                                <div className={styles.statBar}>
                                    <span>HP:</span>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={styles.progress}
                                            style={{ width: `${(opponentHero.hp / opponentHero.maxHp) * 100}%`, backgroundColor: 'green' }}
                                        ></div>
                                    </div>
                                    <span>{opponentHero.hp}/{opponentHero.maxHp}</span>
                                </div>
                                <div className={styles.statBar}>
                                    <span>Mana:</span>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={styles.progress}
                                            style={{ width: `${(opponentHero.mana / opponentHero.maxMana) * 100}%`, backgroundColor: 'blue' }}
                                        ></div>
                                    </div>
                                    <span>{opponentHero.mana}/{opponentHero.maxMana}</span>
                                </div>
                            </div>
                        </div>

                        {/* Duel Logs */}
                        <div className={styles.duelLogs}>
                            {duelLogs.map((log, index) => (
                                <p key={index}>{log}</p>
                            ))}
                        </div>
                    </div>
                )}

                {duelStageState === 'post-duel' && duelResult && (
                    <div className={styles.duelResult}>
                        <p>{duelResult}</p>
                        <button onClick={() => setDuelStageState('base')} className={styles.continueButton}>
                            Continue
                        </button>
                    </div>
                )}

                {duelStageState === 'game-over' && duelResult && (
                    <div className={styles.gameOver}>
                        <p>{duelResult}</p>
                        <button onClick={() => window.location.href = '/home'} className={styles.backToLobbyButton}>
                            Back to Home
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DuelStage;