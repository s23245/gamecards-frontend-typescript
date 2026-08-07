import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import styles from '../styles/Account.module.css';
import type { UserProfile } from '../components/Interfaces';
import { getCurrentUser, updateUsername } from '../services/GameService';
import { clearAuth, storeAuth } from '../auth/token';
import { getErrorMessage } from '../api/client';

const Account = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [username, setUsername] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        let active = true;
        getCurrentUser().then((profile) => {
            if (!active) return;
            setUser(profile);
            setUsername(profile.username);
        }).catch((error) => { if (active) setMessage(getErrorMessage(error, 'Failed to load account.')); });
        return () => { active = false; };
    }, []);

    const handleUpdateUsername = async () => {
        try {
            const response = await updateUsername(username);
            storeAuth(response.token, response.user.username);
            setUser(response.user);
            setUsername(response.user.username);
            setMessage('Username updated successfully. Your session token was refreshed.');
            setEditMode(false);
        } catch (error) {
            setMessage(getErrorMessage(error, 'Failed to update username.'));
        }
    };

    const handleLogout = () => {
        clearAuth();
        navigate('/login', { replace: true });
    };

    return (
        <div className={styles.accountContainer}>
            <Navbar />
            <div className={styles.accountContent}>
                <h2>Account Information</h2>
                {user ? <>
                    <p>First Name: {user.firstName}</p>
                    <p>Last Name: {user.lastName}</p>
                    <p>Email: {user.email}</p>
                    <label htmlFor="username" className="form-label">Username</label>
                    <input id="username" value={username} onChange={(event) => setUsername(event.target.value)}
                           className="form-control" disabled={!editMode} pattern="[A-Za-z0-9_-]{3,30}" />
                    <button onClick={() => { setEditMode(!editMode); setUsername(user.username); }} className={styles.editButton}>
                        {editMode ? 'Cancel' : 'Edit'}
                    </button>
                    {editMode && <button onClick={handleUpdateUsername} className={`${styles.updateButton} btn`}>Update Username</button>}
                </> : <p>Loading account…</p>}
                <button onClick={handleLogout} className={`${styles.logoutButton} btn`}>Logout</button>
                {message && <p role="status" className={styles.message}>{message}</p>}
            </div>
        </div>
    );
};

export default Account;
