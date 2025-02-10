import { Player } from '@app/interfaces/player';

export interface Lobby {
    roomId: string;
    gameId: string;
    host: Player;
    guest?: Player;
}
