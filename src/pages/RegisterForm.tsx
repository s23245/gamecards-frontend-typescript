import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/RegistrationForm.module.css';
import { getErrorMessage } from '../api/client';
import { register } from '../services/GameService';

const RegisterForm = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        setErrorMessage('');
        try {
            await register({ firstName, lastName, email, username, password });
            navigate('/login', { replace: true });
        } catch (error) {
            setErrorMessage(getErrorMessage(error, 'Registration failed.'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.registerContainer}>
            <form onSubmit={handleSubmit} className={styles.registerForm}>
                <h2>Register</h2>
                <input aria-label="First name" className="form-control mb-3" placeholder="First Name" value={firstName}
                       onChange={(event) => setFirstName(event.target.value)} required />
                <input aria-label="Last name" className="form-control mb-3" placeholder="Last Name" value={lastName}
                       onChange={(event) => setLastName(event.target.value)} required />
                <input aria-label="Email" type="email" className="form-control mb-3" placeholder="Email" value={email}
                       onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
                <input aria-label="Username" className="form-control mb-3" placeholder="Username (3–30 letters, numbers, _ or -)"
                       value={username} onChange={(event) => setUsername(event.target.value)}
                       pattern="[A-Za-z0-9_-]{3,30}" autoComplete="username" required />
                <input aria-label="Password" type="password" className="form-control mb-3" placeholder="Password (at least 8 characters)"
                       value={password} onChange={(event) => setPassword(event.target.value)}
                       minLength={8} autoComplete="new-password" required />
                <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                    {submitting ? 'Creating account…' : 'Register'}
                </button>
                {errorMessage && <p role="alert" className="text-danger text-center mt-3">{errorMessage}</p>}
                <p className="text-center mt-3">Already have an account? <Link to="/login">Login here</Link></p>
            </form>
        </div>
    );
};

export default RegisterForm;
