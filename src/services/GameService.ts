import axios from 'axios';
import {Hero} from "../components/Interfaces";

const API_URL = 'http://localhost:8080/api/games';

export const getGameSession = async (gameId: string) => {
    const response = await axios.get(`${API_URL}/${gameId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const searchGame = async () => {
    const response = await axios.post(`${API_URL}/search`, {  }, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const selectHero = async (gameId: string, hero: Hero) => {
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
