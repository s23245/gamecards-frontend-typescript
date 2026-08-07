import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/LoginForm.module.css';
import { getErrorMessage } from '../api/client';
import { login } from '../services/GameService';
import { storeAuth } from '../auth/token';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        setErrorMessage('');
        try {
            const response = await login(username.trim(), password);
            storeAuth(response.token, response.username);
            const destination = (location.state as { from?: string } | null)?.from || '/home';
            navigate(destination, { replace: true });
        } catch (error) {
            setErrorMessage(getErrorMessage(error, 'Login failed. Check your username and password.'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <form onSubmit={handleSubmit} className={styles.loginForm}>
                <h2>Login</h2>
                <div className="mb-3">
                    <label htmlFor="login-username" className="form-label">Username</label>
                    <input id="login-username" className="form-control" value={username}
                           onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="login-password" className="form-label">Password</label>
                    <input id="login-password" type="password" className="form-control" value={password}
                           onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                    {submitting ? 'Logging in…' : 'Login'}
                </button>
                {errorMessage && <p role="alert" className="text-danger text-center mt-3">{errorMessage}</p>}
                <p className="text-center mt-3">Don't have an account? <Link to="/register">Register here</Link></p>
            </form>
        </div>
    );
};

export default LoginForm;
