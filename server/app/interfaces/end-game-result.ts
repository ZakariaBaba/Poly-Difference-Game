import { GameType } from '@common/constants';
import { Score } from '@common/interfaces/score';

export interface EndGameResult {
    gameType: GameType;
    gameId: string;
    gameName?: string;
    score: Score;
    position?: number;
}
