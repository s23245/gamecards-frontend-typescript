import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/LoginForm';
import Register from './pages/RegisterForm';
import Account from './pages/Account';
import HelloPage from './pages/HelloPage';
import GameSession from './components/GameSession/GameSession';
import DuelStage from "./components/DuelStage/DuelStage";
import MusicPlayer from "./components/MusicPlayer/MusicPlayer";
import { GuestRoute, ProtectedRoute } from './components/AuthRoutes';
import { getStoredToken } from './auth/token';

const App: React.FC = () => {
    return (
        <Router>
            <MusicPlayer />
            <Routes>
                <Route path="/hello" element={<HelloPage />} />
                <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
                <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                <Route path="/game-session/:gameId" element={<ProtectedRoute><GameSession /></ProtectedRoute>} />
                <Route path="/duel/:gameId" element={<ProtectedRoute><DuelStage /></ProtectedRoute>} />
                <Route path="/" element={<Navigate to={getStoredToken() ? '/home' : '/login'} replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
