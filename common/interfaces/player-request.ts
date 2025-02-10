import { GameType } from '@common/constants';
export interface PlayerRequest {
    gameId: string;
    playerName: string;
    type?: GameType;
}
