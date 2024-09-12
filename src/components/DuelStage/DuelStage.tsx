import React, { useEffect, useState } from 'react';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Navbar from '../Navbar/Navbar';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './DuelStage.module.css';

interface Hero {
    name: string;
    hp: number;
    mana: number;
    attack: number;
    defense: number;
    attackDamage: number;
    attackSpeed: number;
    mainElement: string;
    abilities: string[];
    imageUrl: string;
}

interface DuelUpdate {
    hero1: Hero;
    hero2: Hero;
}

const DuelStage: React.FC = () => {
    const {gameId} = useParams<{ gameId: string }>();
    const [hero1, setHero1] = useState<Hero | null>(null);
    const [hero2, setHero2] = useState<Hero | null>(null);
    const [duelResult, setDuelResult] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setErrorMessage('Authorization token is missing.');
            return;
        }

        const socketUrl = 'http://localhost:8080/ws';
        const socket = () => new SockJS(socketUrl);
        const stompClient = Stomp.over(socket);

        stompClient.connect(
            {Authorization: `Bearer ${token}`},
            () => {
                // Subscribe to duel progress updates
                stompClient.subscribe(`/topic/duel-progress/${gameId}`, (message) => {
                    try {
                        const duelUpdate: DuelUpdate = JSON.parse(message.body);
                        if (duelUpdate.hero1 && duelUpdate.hero2) {
                            setHero1(duelUpdate.hero1);
                            setHero2(duelUpdate.hero2);
                            setLoading(false);
                        } else {
                            setErrorMessage('Invalid duel update data received.');
                        }
                    } catch (error) {
                        setErrorMessage('Failed to parse duel update.');
                    }
                });

                // Subscribe to duel result
                stompClient.subscribe(`/topic/duel-result/${gameId}`, (message) => {
                    setDuelResult(message.body);
                });
            },
            (error) => {
                setErrorMessage('Failed to connect to WebSocket.');
            }
        );

        // Cleanup on component unmount
        return () => {
            if (stompClient.connected) {
                stompClient.disconnect();
            }
        };
    }, [gameId]);

    const handleStartDuel = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authorization token is missing.');
            }

            await axios.post(
                `http://localhost:8080/api/duel/start`,
                {gameId},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
        } catch (error) {
            setErrorMessage('Failed to start duel.');
        } finally {
            setLoading(false);
        }
    };

// Helper function to get image URL
    const getImageUrl = (imageName: string) => `/src/assets/images/${imageName}`;

    return (
        <div className={styles.duelContainer}>
            <Navbar/>
            <div className={styles.duelContent}>
                {errorMessage && <p className="text-danger">{errorMessage}</p>}
                {loading && <p>Loading Heroes...</p>}
                {duelResult && <p className={styles.winMessage}>{duelResult}</p>}

                <div className={styles.duelStage}>
                    {/* Hero 1 Rendering */}
                    {hero1 ? (
                        <div className={styles.hero1}>
                            <img
                                src={getImageUrl(hero1.imageUrl)}
                                alt={hero1.name}
                                className={styles.heroImage}
                                onError={() => setErrorMessage('Failed to load Hero 1 image.')}
                            />
                            <div className={styles.heroStats}>
                                <p><strong>{hero1.name}</strong></p>
                                <p>HP: {hero1.hp}</p>
                                <p>Mana: {hero1.mana}</p>
                                <p>Attack: {hero1.attack}</p>
                                <p>Defense: {hero1.defense}</p>
                                <p>Attack Damage: {hero1.attackDamage}</p>
                                <p>Attack Speed: {hero1.attackSpeed}</p>
                                <p>Main Element: {hero1.mainElement}</p>
                                <p>Abilities: {hero1.abilities.join(', ')}</p>
                            </div>
                        </div>
                    ) : (
                        !loading && <p>Failed to load Hero 1</p>
                    )}

                    {/* Hero 2 Rendering */}
                    {hero2 ? (
                        <div className={styles.hero2}>
                            <img
                                src={getImageUrl(hero2.imageUrl)}
                                alt={hero2.name}
                                className={styles.heroImage}
                                onError={() => setErrorMessage('Failed to load Hero 2 image.')}
                            />
                            <div className={styles.heroStats}>
                                <p><strong>{hero2.name}</strong></p>
                                <p>HP: {hero2.hp}</p>
                                <p>Mana: {hero2.mana}</p>
                                <p>Attack: {hero2.attack}</p>
                                <p>Defense: {hero2.defense}</p>
                                <p>Attack Damage: {hero2.attackDamage}</p>
                                <p>Attack Speed: {hero2.attackSpeed}</p>
                                <p>Main Element: {hero2.mainElement}</p>
                                <p>Abilities: {hero2.abilities.join(', ')}</p>
                            </div>
                        </div>
                    ) : (
                        !loading && <p>Failed to load Hero 2</p>
                    )}
                </div>
                {!duelResult && (
                    <div className={styles.duelControl}>
                        <button onClick={handleStartDuel} disabled={loading}>
                            {'Start Duel'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
export default DuelStage;