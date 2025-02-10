import { GameMode, GameType } from '../constants';

export interface GameInfo {
    gameId?: string;
    mode: GameMode;
    type: GameType;
}
