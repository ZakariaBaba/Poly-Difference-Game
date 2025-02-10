import {
    CONGRATULATION_MESSAGE,
    CONTINUE_SOLO_MESSAGE,
    FORFEIT_MESSAGE,
    GameMessages,
    LOSER_MESSAGE,
    NOT_IN_TOP_3,
    SAVING_SCORE_ERROR,
    WINNER_MESSAGE,
} from '@app/constants/constant-server';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { GameMode, GameType } from '@common/constants';
import { DifferenceValidation } from '@common/interfaces/difference-validation';

import { EndGameResult } from '@app/interfaces/end-game-result';
import { ChatService } from '@app/services/chat/chat.service';
import { ScoreService } from '@app/services/score/score.service';
import { ChatEvents } from '@common/events/chat.events';
import { DifferencesEvents } from '@common/events/differences.events';
import { GameEvents } from '@common/events/game.events';
import { LobbyEvents } from '@common/events/lobby.events';
import { TimerEvents } from '@common/events/timer.events';
import { Coordinates } from '@common/interfaces/coordinates';
import { Difference } from '@common/interfaces/difference';
import { GameInfo } from '@common/interfaces/game-info';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class GameGateway {
    @WebSocketServer() private server: Server;

    constructor(private gameManagerService: GameManagerService, private scoreManager: ScoreService, private chatService: ChatService) {}

    @SubscribeMessage(DifferencesEvents.Validate)
    validate(socket: Socket, coordinates: Coordinates) {
        const roomId = this.gameManagerService.getRoomId(socket.id);
        if (this.gameManagerService.getGameMode(roomId) === GameMode.Sprint) this.validateSprint(socket, coordinates, roomId);
        else this.validateClassic(socket, coordinates, roomId);
    }

    @SubscribeMessage(DifferencesEvents.AllDifferences)
    sendAllDifferences(socket: Socket) {
        const roomId = this.gameManagerService.getRoomId(socket.id);
        if (roomId) {
            socket.emit(DifferencesEvents.AllDifferences, this.gameManagerService.getAllDifferences(roomId));
        }
    }

    @SubscribeMessage(GameEvents.LeaveGame)
    leaveGame(socket: Socket) {
        const roomId = this.gameManagerService.getRoomId(socket.id);
        if (roomId) {
            this.leaveGameRoutine(roomId, socket.id);
        }
    }

    @SubscribeMessage(GameEvents.CheckGameStatus)
    checkGameStatus(socket: Socket) {
        socket.emit(GameEvents.GameStatus, this.gameManagerService.getRoomId(socket.id) !== undefined);
    }

    @SubscribeMessage(GameEvents.PageLoaded)
    setTimerEvents(socket: Socket) {
        const roomId = this.gameManagerService.getRoomId(socket.id);
        if (!roomId) return;
        this.subscribeToTimerEvents(socket);
        socket.emit(TimerEvents.Timer, this.gameManagerService.getTimerInitialValue(roomId));
        socket.emit(GameEvents.Constant, this.gameManagerService.getGameConstants(roomId));
    }

    @SubscribeMessage(DifferencesEvents.RequestHint)
    getHint(socket: Socket) {
        const hint = this.gameManagerService.getHint(this.gameManagerService.getRoomId(socket.id));
        this.server
            .to(this.gameManagerService.getRoomId(socket.id))
            .emit(ChatEvents.MESSAGE_CLIENT, this.chatService.formatSystemMessage(GameMessages.HintUsed));
        socket.emit(DifferencesEvents.ReturnHint, hint);
    }

    @SubscribeMessage(GameEvents.ContinueSolo)
    continueSolo(socket: Socket) {
        const roomId = this.gameManagerService.getRoomId(socket.id);
        if (roomId) this.gameManagerService.startCountdown(roomId);
        socket.emit(GameEvents.GameInfo, {
            type: this.gameManagerService.getGameType(roomId),
            mode: this.gameManagerService.getGameMode(roomId),
        } as GameInfo);
        socket.emit(GameEvents.PlayerNames, [this.gameManagerService.getPlayerName(socket.id)]);
    }

    handleDisconnect(socket: Socket) {
        this.leaveGame(socket);
    }

    private validateClassic(socket: Socket, coordinates: Coordinates, roomId: string) {
        const difference = this.gameManagerService.validateDifference(roomId, coordinates, socket.id);
        if (difference) {
            this.foundDifferenceRoutine(difference, roomId);
            this.emitDifferenceMessage(socket.id, GameMessages.DifferenceFound);
        } else {
            socket.emit(DifferencesEvents.ErrorDifference);
            this.emitDifferenceMessage(socket.id, GameMessages.ErrorDifference);
        }
    }

    private validateSprint(socket: Socket, coordinates: Coordinates, roomId: string) {
        const differencesValidation = this.gameManagerService.validateSprintDifference(roomId, coordinates);
        if (differencesValidation?.difference) {
            this.foundSprintDifferenceRoutine(differencesValidation, roomId);
            this.emitDifferenceMessage(socket.id, GameMessages.DifferenceFound);
        } else {
            socket.emit(DifferencesEvents.ErrorDifference);
            this.emitDifferenceMessage(socket.id, GameMessages.ErrorDifference);
        }
    }

    private foundDifferenceRoutine(difference: Difference, roomId: string) {
        this.server.to(roomId).emit(DifferencesEvents.DifferenceFound, difference);
        this.server.to(roomId).emit(DifferencesEvents.DifferenceCount, this.gameManagerService.getDifferenceCount(roomId));

        if (this.gameManagerService.getIsFinished(roomId)) {
            this.endGameRoutine(roomId);
        }
    }

    private foundSprintDifferenceRoutine(differenceValidation: DifferenceValidation, roomId: string) {
        this.server.to(roomId).emit(DifferencesEvents.DifferenceCount, this.gameManagerService.getDifferenceCount(roomId));

        if (!differenceValidation.gameId) {
            this.endGameRoutine(roomId);
            return;
        }
        this.server.to(roomId).emit(GameEvents.GameSwitch, differenceValidation.gameId);
    }

    private subscribeToTimerEvents(socket: Socket) {
        const roomId = this.gameManagerService.getRoomId(socket.id);
        this.gameManagerService.getTimerObservable(roomId).subscribe((timer: number) => {
            this.emitTimer(roomId, timer);
            if (this.gameManagerService.getGameMode(roomId) === GameMode.Sprint && this.gameManagerService.getIsFinished(roomId)) {
                this.timerEndRoutine(socket, roomId);
                return;
            }
        });
    }

    private emitTimer(roomId: string, timer: number) {
        this.server.to(roomId).emit(TimerEvents.Timer, timer);
    }

    private emitDifferenceMessage(socketId: string, messageContent: GameMessages) {
        const playerName: string | undefined = this.gameManagerService.getPlayerName(socketId);
        const message = playerName ? `${messageContent} par ${playerName}` : messageContent;
        this.server.to(this.gameManagerService.getRoomId(socketId)).emit(ChatEvents.MESSAGE_CLIENT, this.chatService.formatSystemMessage(message));
    }

    private leaveGameRoutine(roomId: string, socketId: string) {
        if (this.gameManagerService.getGameType(roomId) === GameType.Multiplayer && !this.gameManagerService.getIsFinished(roomId)) {
            const message = `${this.gameManagerService.getPlayerName(socketId)} ${GameMessages.PlayerLeft}`;
            this.server.to(roomId).emit(ChatEvents.MESSAGE_CLIENT, this.chatService.formatSystemMessage(message));
            switch (this.gameManagerService.getGameMode(roomId)) {
                case GameMode.Classic:
                    this.server.to(roomId).emit(GameEvents.GameFinished, FORFEIT_MESSAGE);
                    this.gameManagerService.stopTimer(roomId);
                    this.gameManagerService.deleteGame(roomId);
                    break;
                case GameMode.Sprint:
                    this.server.to(roomId).emit(GameEvents.PlayerLeft, CONTINUE_SOLO_MESSAGE);
                    this.gameManagerService.removePlayer(roomId, socketId);
                    this.gameManagerService.stopTimer(roomId);
                    break;
            }
        }
    }

    private async endGameRoutine(roomId: string) {
        this.gameManagerService.stopTimer(roomId);
        switch (this.gameManagerService.getGameMode(roomId)) {
            case GameMode.Classic:
                await this.scoreManager
                    .endGameRoutine(this.gameManagerService.getEndGameResult(roomId))
                    .then((endGameResult: EndGameResult) => {
                        if (endGameResult.position > NOT_IN_TOP_3) {
                            this.server.to('serverRoom').emit(LobbyEvents.StatusChanged);
                            this.server.emit(ChatEvents.MESSAGE_CLIENT, this.chatService.formatNewRecordMessage(endGameResult));
                        }
                    })
                    .catch(() => {
                        this.server.to(roomId).emit(ChatEvents.MESSAGE_CLIENT, this.chatService.formatSystemMessage(SAVING_SCORE_ERROR));
                    });
                if (this.gameManagerService.getGameType(roomId) === GameType.Multiplayer) {
                    this.server.to(this.gameManagerService.getWinnerId(roomId)).emit(GameEvents.GameFinished, WINNER_MESSAGE);
                    this.server.to(this.gameManagerService.getLoserId(roomId)).emit(GameEvents.GameFinished, LOSER_MESSAGE);
                } else {
                    this.server.to(roomId).emit(GameEvents.GameFinished, WINNER_MESSAGE);
                }
                break;
            case GameMode.Sprint:
                this.gameManagerService.stopTimer(roomId);
                this.server.to(roomId).emit(GameEvents.GameFinished, CONGRATULATION_MESSAGE);
        }
    }

    private timerEndRoutine(socket: Socket, roomId: string) {
        this.gameManagerService.stopTimer(roomId);
        socket.emit(GameEvents.GameFinished, CONGRATULATION_MESSAGE);
    }
}
