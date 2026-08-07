import { apiClient } from '../api/client';
import type {
    AuthResponse, DuelState, GameSessionData, UserProfile, UsernameUpdateResponse,
} from '../components/Interfaces';

export const register = async (payload: {
    firstName: string; lastName: string; email: string; username: string; password: string;
}): Promise<UserProfile> => (await apiClient.post<UserProfile>('/api/register', payload)).data;

export const login = async (username: string, password: string): Promise<AuthResponse> =>
    (await apiClient.post<AuthResponse>('/api/login', { username, password })).data;

export const getCurrentUser = async (): Promise<UserProfile> =>
    (await apiClient.get<UserProfile>('/api/user/current')).data;

export const updateUsername = async (username: string): Promise<UsernameUpdateResponse> =>
    (await apiClient.put<UsernameUpdateResponse>('/api/user/username', { username })).data;

export const searchGame = async (): Promise<GameSessionData> =>
    (await apiClient.post<GameSessionData>('/api/games/search')).data;

export const getGameSession = async (gameId: string): Promise<GameSessionData> =>
    (await apiClient.get<GameSessionData>(`/api/games/${gameId}`)).data;

export const selectHero = async (gameId: string, heroId: number): Promise<GameSessionData> =>
    (await apiClient.post<GameSessionData>(`/api/games/${gameId}/heroes/${heroId}`)).data;

export const getDuelState = async (gameId: string): Promise<DuelState> =>
    (await apiClient.get<DuelState>(`/api/duel/${gameId}/state`)).data;

export const chooseCard = async (gameId: string, cardId: number): Promise<{ attributeChanges: string[] }> =>
    (await apiClient.post<{ attributeChanges: string[] }>('/api/duel/choose-card', { gameId, cardId })).data;
