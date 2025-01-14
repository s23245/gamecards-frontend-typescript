import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/LoginForm';
import Register from './pages/RegisterForm';
import DuelDemo from './pages/DuelDemo';
import Account from './pages/Account';
import HelloPage from './pages/HelloPage';
import GameSession from './components/GameSession/GameSession';
import DuelStage from "./components/DuelStage/DuelStage";
import MusicPlayer from "./components/MusicPlayer/MusicPlayer";

//import { withAuthenticator } from '@aws-amplify/ui-react';

const App: React.FC = () => {
    return (
        <Router>
            <MusicPlayer />
            <Routes>
                <Route path="/hello" element={<HelloPage />} />
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
