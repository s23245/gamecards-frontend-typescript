import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Home.module.css';
import { getErrorMessage } from '../api/client';
import { getCurrentUser, searchGame } from '../services/GameService';

const Home = () => {
    const [searching, setSearching] = useState(false);
    const [message, setMessage] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        let active = true;
        getCurrentUser()
            .then((user) => { if (active) setUsername(user.username); })
            .catch((error) => { if (active) setMessage(getErrorMessage(error, 'Unable to load your account.')); });
        return () => { active = false; };
    }, []);

    const handleSearchGame = async () => {
        if (searching) return;
        setSearching(true);
        setMessage('Searching for another player…');
        try {
            const game = await searchGame();
            if (!game.id) throw new Error('The server returned an invalid game session.');
            navigate(`/game-session/${game.id}`);
        } catch (error) {
            setMessage(getErrorMessage(error, 'Could not start matchmaking.'));
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className={styles.homeContainer}>
            <Navbar />
            <div className={styles.homeContent}>
                <h1 className={styles.homeTitle}>Welcome to GameCards{username ? `, ${username}` : ''}</h1>
                <p className={styles.homeDescription}>Challenge another player, choose your hero, and build power with cards between duels.</p>
                <button onClick={handleSearchGame} className={`btn btn-primary ${styles.searchButton}`} disabled={searching || !username}>
                    {searching ? 'Searching…' : 'Find Game'}
                </button>
                {message && <p role="status" className={styles.searchMessage}>{message}</p>}
            </div>
        </div>
    );
};

export default Home;
