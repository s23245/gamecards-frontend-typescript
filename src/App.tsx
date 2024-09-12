import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/LoginForm';
import Register from './pages/RegisterForm';
import DuelDemo from './pages/DuelDemo';
import Account from './pages/Account';
import GameSession from './components/GameSession/GameSession';
import DuelStage from "./components/DuelStage/DuelStage";

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/duel-demo" element={<DuelDemo />} />
                <Route path="/account" element={<Account />} />
                <Route path="/game-session/:gameId" element={<GameSession />} />
                <Route path="/duel/:gameId" element={<DuelStage />} />
                <Route path="/" element={<Home />} />
            </Routes>
        </Router>
    );
};

export default App;
