import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import axios from 'axios';
import styles from '../styles/Account.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';

interface User {
    firstName: string;
    lastName: string;
    email: string;
    username: string | null;
}

const Account: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [username, setUsername] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8080/api/user/current', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setUser(response.data);
                setUsername(response.data.username || '');
            } catch (error) {
                console.error('Failed to fetch user:', error);
            }
        };

        fetchUser();
    }, []);

    const handleUpdateUsername = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:8080/api/user/username', { username }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessage('Username updated successfully');
            setEditMode(false);
            // Refresh user data
            const response = await axios.get('http://localhost:8080/api/user/current', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUser(response.data);
        } catch (error) {
            setMessage('Failed to update username');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <div className={styles.accountContainer}>
            <Navbar />
            <div className={styles.accountContent}>
                <h2>Account Information</h2>
                {user ? (
                    <>
                        <p>First Name: {user.firstName}</p>
                        <p>Last Name: {user.lastName}</p>
                        <p>Email: {user.email}</p>
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="form-control"
                                disabled={!editMode}
                            />
                            <button
                                onClick={() => setEditMode(!editMode)}
                                className={`btn ${styles.editButton}`}
                            >
                                {editMode ? 'Cancel' : 'Edit'}
                            </button>
                        </div>
                        {editMode && (
                            <button
                                onClick={handleUpdateUsername}
                                className="btn btn-primary w-100 mb-3"
                            >
                                Update Username
                            </button>
                        )}
                    </>
                ) : (
                    <p>Loading...</p>
                )}
                <button onClick={handleLogout} className={`btn btn-danger w-100 ${styles.logoutButton}`}>Logout</button>
                {message && <p className="mt-3">{message}</p>}
            </div>
        </div>
    );
};

export default Account;
