// src/services/GameService.ts
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/games';

export const getGameSession = async (gameId: string) => {
    const response = await axios.get(`${API_URL}/${gameId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const searchGame = async (username: string) => {
    const response = await axios.post(`${API_URL}/search`, { username }, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const selectHero = async (gameId: string, hero: any) => {
    const response = await axios.post(`${API_URL}/${gameId}/select-hero`, hero, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const startDuel = async (gameId: string) => {
    const response = await axios.post(`${API_URL}/${gameId}/start-duel`, null, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};
