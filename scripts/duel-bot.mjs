import { Client } from '@stomp/stompjs';
import WebSocket from 'ws';

const apiUrl = process.env.GAMECARDS_API_URL ?? 'http://localhost:8080';
const wsUrl = process.env.GAMECARDS_WS_URL ?? 'ws://localhost:8080/ws/websocket';
const username = process.env.GAMECARDS_BOT_USERNAME;
const password = process.env.GAMECARDS_BOT_PASSWORD;
const gameId = process.env.GAMECARDS_GAME_ID;

if (!username || !password || !gameId) {
  console.error('Set GAMECARDS_BOT_USERNAME, GAMECARDS_BOT_PASSWORD, and GAMECARDS_GAME_ID.');
  process.exit(1);
}

const request = async (path, options = {}) => {
  const response = await fetch(`${apiUrl}${path}`, options);
  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${path} failed (${response.status}): ${await response.text()}`);
  }
  return response.status === 204 ? undefined : response.json();
};

const auth = await request('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password }),
});
const headers = {
  Authorization: `Bearer ${auth.token}`,
  'Content-Type': 'application/json',
};

let submittedCardId;
const chooseCard = async (cards) => {
  const card = cards?.[0];
  if (!card || submittedCardId === card.id) return;
  submittedCardId = card.id;
  await request('/api/duel/choose-card', {
    method: 'POST',
    headers,
    body: JSON.stringify({ gameId, cardId: card.id }),
  });
  console.log(`Selected card ${card.id}: ${card.name}`);
};

const recoverState = async () => {
  const state = await request(`/api/duel/${gameId}/state`, { headers });
  if (state.phase !== 'CARD_SELECTION') submittedCardId = undefined;
  await chooseCard(state.cards);
};

const client = new Client({
  webSocketFactory: () => new WebSocket(wsUrl),
  connectHeaders: { Authorization: `Bearer ${auth.token}` },
  reconnectDelay: 2_000,
  heartbeatIncoming: 10_000,
  heartbeatOutgoing: 10_000,
  debug: process.env.GAMECARDS_STOMP_DEBUG ? console.log : () => {},
});

client.onConnect = async () => {
  console.log(`Connected as ${username}`);
  client.subscribe(`/topic/cards/${gameId}/${username}`, async (message) => {
    submittedCardId = undefined;
    await chooseCard(JSON.parse(message.body));
  });
  client.subscribe(`/topic/game-error/${gameId}`, (message) => {
    console.error(message.body);
    process.exitCode = 1;
    void client.deactivate();
  });
  client.subscribe(`/topic/game-over/${gameId}`, (message) => {
    console.log(`Game over: ${message.body}`);
    void client.deactivate();
  });
  client.publish({ destination: '/app/player-ready', body: JSON.stringify({ gameId }) });
  await recoverState();
};

client.onStompError = (frame) => {
  console.error(`STOMP error: ${frame.headers.message ?? frame.body}`);
  process.exitCode = 1;
  void client.deactivate();
};
client.onWebSocketError = (error) => console.error(`WebSocket error: ${error.message}`);

client.activate();

process.on('SIGINT', () => void client.deactivate());
