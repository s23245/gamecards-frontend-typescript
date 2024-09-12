import React, { useEffect, useState } from 'react';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import Navbar from '../components/Navbar/Navbar';
import styles from '../styles/DuelDemo.module.css';

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

const DuelDemo: React.FC = () => {
    const [hero1, setHero1] = useState<Hero | null>(null);
    const [hero2, setHero2] = useState<Hero | null>(null);
    const [duelResult, setDuelResult] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [lastUpdateTime, setLastUpdateTime] = useState(0);

    // Use a static gameId for testing purposes
    const gameId = '49a08f8f-91ee-4e98-ac5e-7fce57f4d8db';

    useEffect(() => {
        const token = localStorage.getItem('token');
        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = Stomp.over(() => socket);

        stompClient.connect({ 'Authorization': `Bearer ${token}` }, () => {
            console.log('WebSocket connected');

            stompClient.subscribe(`/topic/duel-progress/${gameId}`, (message) => {
                const currentTime = new Date().getTime();
                if (currentTime - lastUpdateTime >= 1000) {
                    const duelUpdate = JSON.parse(message.body);
                    setHero1({ ...duelUpdate.hero1 });
                    setHero2({ ...duelUpdate.hero2 });
                    setLastUpdateTime(currentTime);
                }
            });

            stompClient.subscribe(`/topic/duel-result/${gameId}`, (message) => {
                setDuelResult(message.body);
            });
        }, (error: unknown) => {
            if (error instanceof Error) {
                setErrorMessage('Error connecting to WebSocket: ' + error.message);
            } else {
                setErrorMessage('Error connecting to WebSocket');
            }
        });

        return () => {
            stompClient.disconnect();
        };
    }, [lastUpdateTime, gameId]);

    const startDuel = async () => {
        try {
            const token = localStorage.getItem('token');
            const requestBody = { gameId };  // Use the static gameId for the request

            const response = await axios.post('http://localhost:8080/api/duel/start', requestBody, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });

            console.log('Duel started successfully:', response.data);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.status === 403) {
                    setErrorMessage('Duel start forbidden: Unauthorized');
                } else {
                    setErrorMessage('Error starting duel: ' + error.message);
                }
            } else {
                setErrorMessage('Error starting duel: ' + error);
            }
        }
    };

    const getImageUrl = (imageName: string) => {
        return `/src/assets/images/${imageName}`;
    };

    const renderHeroStats = (hero: Hero) => (
        <div className={styles.heroStats}>
            <p><strong>{hero.name}</strong></p>
            <p>HP: {hero.hp}</p>
            <p>Mana: {hero.mana}</p>
            <p>Attack: {hero.attack}</p>
            <p>Defense: {hero.defense}</p>
            <p>Attack Damage: {hero.attackDamage}</p>
            <p>Attack Speed: {hero.attackSpeed}</p>
            <p>Main Element: {hero.mainElement}</p>
            <p>Abilities: {hero.abilities.join(', ')}</p>
        </div>
    );

    return (
        <div className={styles.duelContainer}>
            <Navbar />
            <div className={styles.duelContent}>
                {errorMessage && <p className="text-danger">{errorMessage}</p>}
                <div className={styles.duelStage}>
                    {duelResult && <p className={styles.winMessage}>{duelResult}</p>}
                    {hero1 && (
                        <div className={styles.hero1}>
                            <img src={getImageUrl(hero1.imageUrl)} alt="Hero 1" className={styles.heroImage} />
                            {renderHeroStats(hero1)}
                        </div>
                    )}
                    {hero2 && (
                        <div className={styles.hero2}>
                            <img src={getImageUrl(hero2.imageUrl)} alt="Hero 2" className={styles.heroImage} />
                            {renderHeroStats(hero2)}
                        </div>
                    )}
                </div>
                <button onClick={startDuel} className={`btn btn-success mt-4 ${styles.startDuelButton}`}>
                    Start Duel
                </button>
            </div>
        </div>
    );
};

export default DuelDemo;