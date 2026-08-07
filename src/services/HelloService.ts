import { apiClient } from '../api/client';

export async function getHelloMessage(): Promise<string> {
    return (await apiClient.get<string>('/api/hello')).data;
}
