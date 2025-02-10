import { LOCALE } from '@app/constants/constant-server';
import { EndGameResult } from '@app/interfaces/end-game-result';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { GameType, Position } from '@common/constants';
import { Message, MessageType } from '@common/interfaces/message';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class ChatService {
    constructor(private gameManagerService: GameManagerService) {}

    formatPlayerMessage(message: string, socket: Socket): Message {
        return {
            content: message,
            time: new Date().toLocaleTimeString(LOCALE),
            type: this.getPlayerType(socket),
            name: this.gameManagerService.getPlayerName(socket.id),
        } as Message;
    }

    formatSystemMessage(message: string): Message {
        return {
            content: message,
            time: new Date().toLocaleTimeString(LOCALE),
            type: MessageType.System,
            name: MessageType.System,
        } as Message;
    }

    formatNewRecordMessage(endGameResult: EndGameResult): Message {
        const gameType = endGameResult.gameType === GameType.Solo ? GameType.Solo : 'un contre un';
        const position = this.getPositionInString(endGameResult.position);
        const message =
            `${endGameResult.score.playerName} obtient la ${position} place` +
            ` dans les meilleurs temps du jeu ${endGameResult.gameName} en ${gameType}`;
        return this.formatSystemMessage(message);
    }

    getRoomId(socket: Socket): string {
        return this.gameManagerService.getRoomId(socket.id);
    }

    private getPlayerType(socket: Socket): MessageType.Host | MessageType.Guest {
        const roomId = this.gameManagerService.getRoomId(socket.id);
        const hostId = this.gameManagerService.getMultiplayerGame(roomId)?.hostSocketId;
        if (socket.id === hostId) {
            return MessageType.Host;
        } else {
            return MessageType.Guest;
        }
    }

    private getPositionInString(position: number): string {
        switch (position) {
            case 1:
                return Position.First;
            case 2:
                return Position.Second;
            case 3:
                return Position.Third;
            default:
                return '';
        }
    }
}
