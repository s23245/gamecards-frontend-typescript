import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/LoginForm.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/login', { email, password }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (response.status === 200) {
                const token = response.data.token || response.headers['Authorization']?.split(' ')[1];
                if (token) {
                    localStorage.setItem('token', token);
                    localStorage.setItem('username', response.data.username);
                    navigate('/home');
                } else {
                    setErrorMessage('Login failed: Authorization token missing');
                }
            } else {
                setErrorMessage('Login failed: Response data is undefined');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.status === 401) {
                    setErrorMessage('Login failed: Unauthorized');
                } else {
                    setErrorMessage('Login failed: An error occurred');
                }
            } else {
                setErrorMessage('Login failed: An error occurred');
            }
        }
    };

    return (
        <div className={styles.loginContainer}>
            <form onSubmit={handleSubmit} className={styles.loginForm}>
                <h2>Login</h2>
                <div className="mb-3">
                    <input type="email" className="form-control" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <input type="password" className="form-control" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary w-100">Login</button>
                {errorMessage && <p className="text-danger text-center mt-3">{errorMessage}</p>}
                <p className="text-center mt-3">
                    Don't have an account? <a href="/register">Register here</a>
                </p>
            </form>
        </div>
    );
};

export default LoginForm;
