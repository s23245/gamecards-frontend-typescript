import type { DuelState } from '../Interfaces';
import { phaseToStage } from './duelState';

const state = (phase: string, overrides: Partial<DuelState> = {}): DuelState => ({
    gameId: 'game-1', phase, roundNumber: 1, playerHero: null, opponentHero: null,
    cards: [], players: [], selectedCardId: null, result: null, gameOver: false, ...overrides,
});

it('maps authoritative duel phases without reopening completed or submitted rounds', () => {
    expect(phaseToStage(state('CARD_SELECTION'))).toBe('base');
    expect(phaseToStage(state('CARD_SELECTION', { selectedCardId: 12 }))).toBe('waiting');
    expect(phaseToStage(state('COUNTDOWN'))).toBe('countdown');
    expect(phaseToStage(state('DUEL'))).toBe('duel');
    expect(phaseToStage(state('RESULT'))).toBe('post-duel');
    expect(phaseToStage(state('CARD_SELECTION', { gameOver: true }))).toBe('game-over');
});
