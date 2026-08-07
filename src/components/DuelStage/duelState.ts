import type { DuelState } from '../Interfaces';

export type Stage = 'loading' | 'base' | 'waiting' | 'countdown' | 'duel' | 'post-duel' | 'game-over' | 'reconnecting' | 'error';

export const phaseToStage = (state: DuelState): Stage => {
    if (state.gameOver || state.phase === 'GAME_OVER') return 'game-over';
    if (state.phase === 'CARD_SELECTION') return state.selectedCardId ? 'waiting' : 'base';
    if (state.phase === 'COUNTDOWN') return 'countdown';
    if (state.phase === 'DUEL') return 'duel';
    if (state.phase === 'RESULT') return 'post-duel';
    if (state.phase === 'ERROR') return 'error';
    return 'loading';
};
