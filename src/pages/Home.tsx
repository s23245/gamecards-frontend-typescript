// src/pages/Home.tsx
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import { searchGame } from '../services/GameService';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/Home.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Home: React.FC = () => {
    const [searching, setSearching] = useState(false);
    const [searchMessage, setSearchMessage] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8080/api/user/current', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setUsername(response.data.username || '');
            } catch (error) {
                console.error('Failed to fetch user info:', error);
            }
        };

        fetchUserInfo();
    }, []);

    const handleSearchGame = async () => {
        if (!username) {
            setSearchMessage('Please enter your username.');
            return;
        }
        setSearching(true);
        setSearchMessage('Searching for a game...');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }
            const response = await axios.post(`http://localhost:8080/api/games/search`, { username }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSearchMessage(`Game found! Game ID: ${response.data.id}`);
            navigate(`/game-session/${response.data.id}`);
        } catch (error) {
            setSearchMessage('Error searching for a game. Please try again.');
        } finally {
            setSearching(false);
        }
    };


    return (
        <div className={styles.homeContainer}>
            <Navbar />
            <div className={styles.homeContent}>
                <img src="/src/assets/images/gamecards_logo.webp" alt="GameCards Logo" className={styles.logoImage} />
                <h1 className={styles.homeTitle}>Welcome to GameCards</h1>
                <p className={styles.homeDescription}>
                    Prepare for an exciting adventure in the world of GameCards. Challenge your friends to duels and become the ultimate champion!
                </p>
                <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`form-control mb-3 ${styles.usernameInput}`}
                />
                <button onClick={handleSearchGame} className={`btn btn-primary ${styles.searchButton}`} disabled={searching}>
                    {searching ? 'Searching...' : 'Find Game'}
                </button>
                {searchMessage && <p className={styles.searchMessage}>{searchMessage}</p>}
            </div>
        </div>
    );
};

export default Home;
