import { PlayerType } from '@app/interfaces/player-type';

export interface Player {
    id: string;
    score: number;
    name: string;
    playerType: PlayerType;
}
