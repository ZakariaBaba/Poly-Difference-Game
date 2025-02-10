import {
    GAME_DELETED_MESSAGE,
    HOST_LEFT_MESSAGE,
    LOBBY_ALREADY_CREATED_MESSAGE,
    LOBBY_FULL_MESSAGE,
    REQUEST_REJECTED_MESSAGE,
} from '@app/constants/constant-server';
import { Lobby } from '@app/interfaces/lobby';
import { PlayerType } from '@app/interfaces/player-type';
import { GameCreationService } from '@app/services/game-creation/game-creation.service';
import { ListGameService } from '@app/services/list-game/list-game.service';
import { LobbyManagerService } from '@app/services/lobby-manager/lobby-manager.service';
import { ScoreService } from '@app/services/score/score.service';
import { GameMode, GameType } from '@common/constants';
import { GameEvents } from '@common/events/game.events';
import { LobbyEvents } from '@common/events/lobby.events';
import { GameInfo } from '@common/interfaces/game-info';
import { PlayerRequest } from '@common/interfaces/player-request';
import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class LobbyGateway implements OnGatewayInit {
    @WebSocketServer() private server: Server;
    private serverRoom = 'serverRoom';
    private globalRoom = 'globalRoom';

    // eslint-disable-next-line max-params
    constructor(
        private listGameService: ListGameService,
        private scoreService: ScoreService,
        private logger: Logger,
        private lobbyManagerService: LobbyManagerService,
        private gameCreationService: GameCreationService,
    ) {}

    @SubscribeMessage(LobbyEvents.StartSolo)
    handleStartSolo(socket: Socket, soloRequest: PlayerRequest) {
        this.logger.log(`Start solo game ${soloRequest.gameId} by user with id : ${socket.id}`);
        this.startSoloGame(socket, soloRequest);
        this.server.to(socket.id).emit(GameEvents.PlayerNames, [soloRequest.playerName]);
        this.server.to(socket.id).emit(GameEvents.GameInfo, { gameId: soloRequest.gameId, mode: GameMode.Classic, type: GameType.Solo } as GameInfo);
    }

    @SubscribeMessage(LobbyEvents.Create)
    createClassicLobby(hostSocket: Socket, createRequest: PlayerRequest) {
        if (this.lobbyManagerService.isLobbyCreated(createRequest.gameId)) {
            this.server.to(hostSocket.id).emit(LobbyEvents.Alert, LOBBY_ALREADY_CREATED_MESSAGE);
        } else {
            this.updateGameStatus(createRequest.gameId, true);
            const lobby: Lobby = this.lobbyManagerService.createLobby(createRequest, hostSocket.id);
            hostSocket.join(lobby.roomId);
        }
    }

    @SubscribeMessage(LobbyEvents.CreateMultiplayerSprint)
    createMultiplayerSprint(socket: Socket, createRequest: PlayerRequest) {
        if (this.lobbyManagerService.isLobbyCreated(createRequest.gameId)) {
            const roomId: string = this.lobbyManagerService.getRoomId(createRequest.gameId);
            socket.join(roomId);
            this.lobbyManagerService.setGuestPlayer(createRequest, socket.id);
            this.server.to(roomId).emit(GameEvents.StartMultiplayerGame);
            this.server.to(roomId).emit(GameEvents.PlayerNames, this.lobbyManagerService.getPlayerNames(createRequest.gameId));
            const randomGameId = this.getRandomGameId();
            this.server.to(roomId).emit(GameEvents.GameInfo, {
                gameId: randomGameId,
                mode: GameMode.Sprint,
                type: GameType.Multiplayer,
            } as GameInfo);
            this.startSprintMultiplayerGame(socket, randomGameId);
        } else {
            const lobby = this.lobbyManagerService.createLobby(createRequest, socket.id);
            socket.join(lobby.roomId);
            this.server.to(lobby.roomId).emit(LobbyEvents.Wait);
        }
    }

    @SubscribeMessage(LobbyEvents.CreateSoloSprint)
    createSoloSprint(socket: Socket, playerName: string) {
        const randomGameId = this.getRandomGameId();
        this.lobbyManagerService.createSoloSprintGame(randomGameId, {
            roomId: socket.id,
            host: { id: socket.id, score: 0, name: playerName, playerType: PlayerType.Host },
        } as Lobby);
        this.server.to(socket.id).emit(GameEvents.PlayerNames, [playerName]);
        this.server.to(socket.id).emit(GameEvents.GameInfo, { gameId: randomGameId, mode: GameMode.Sprint, type: GameType.Solo } as GameInfo);
    }

    @SubscribeMessage(LobbyEvents.Join)
    joinLobby(guestSocket: Socket, joinRequest: PlayerRequest) {
        if (!this.lobbyManagerService.isLobbyCreated(joinRequest.gameId)) {
            this.server.to(guestSocket.id).emit(LobbyEvents.Alert, HOST_LEFT_MESSAGE);
        } else if (this.lobbyManagerService.getGuestPlayer(joinRequest.gameId)) {
            guestSocket.emit(LobbyEvents.Alert, LOBBY_FULL_MESSAGE);
        } else {
            this.lobbyManagerService.setGuestPlayer(joinRequest, guestSocket.id);
            const roomId: string = this.lobbyManagerService.getRoomId(joinRequest.gameId);
            guestSocket.join(roomId);
            guestSocket.to(roomId).emit(LobbyEvents.RequestToJoin, joinRequest);
            this.logger.log(`Player id ${guestSocket.id} has joined the lobby of the game id ${joinRequest.gameId}`);
        }
    }

    @SubscribeMessage(LobbyEvents.Reject)
    rejectPlayer(hostSocket: Socket, gameId: string) {
        const guestSocket = this.getSocketFromId(this.lobbyManagerService.getGuestPlayer(gameId).id);
        guestSocket.emit(LobbyEvents.Alert, REQUEST_REJECTED_MESSAGE);
        guestSocket.leave(this.lobbyManagerService.getRoomId(gameId));
        this.lobbyManagerService.removeGuestPlayer(gameId);
        this.updateGameStatus(gameId, true);
    }

    @SubscribeMessage(LobbyEvents.Accepted)
    acceptPlayer(hostSocket: Socket, gameId: string) {
        const roomId = this.lobbyManagerService.getRoomId(gameId);
        this.server.to(roomId).emit(GameEvents.StartMultiplayerGame);
        this.server.to(roomId).emit(GameEvents.PlayerNames, this.lobbyManagerService.getPlayerNames(gameId));
        this.server.to(roomId).emit(GameEvents.GameInfo, { gameId, mode: GameMode.Classic, type: GameType.Multiplayer } as GameInfo);
        this.updateGameStatus(gameId, false);
        this.startMultiplayerGame(hostSocket, gameId);
    }

    @SubscribeMessage(LobbyEvents.LeaveLobby)
    leaveLobby(socket: Socket) {
        const gameId = this.lobbyManagerService.getGameIdFromPlayerId(socket.id);
        const host = this.lobbyManagerService.getHostPlayer(gameId);
        if (!host) {
            return;
        }
        if (socket.id === host.id) {
            this.leaveFromHost(gameId);
        } else {
            this.lobbyManagerService.removeGuestPlayer(gameId);
            socket.to(host.id).emit(LobbyEvents.Left, gameId);
        }
        socket.leave(this.lobbyManagerService.getRoomId(gameId));
    }

    afterInit() {
        this.subscribeToLobbyEvents();
    }

    handleConnection(socket: Socket) {
        socket.join(this.serverRoom);
        socket.join(this.globalRoom);
        this.logger.log(`Player id ${socket.id} has joined the server room`);
    }

    handleDisconnect(socket: Socket) {
        this.leaveLobby(socket);
        socket.leave(this.serverRoom);

        this.logger.log(`Player id ${socket.id} has left the server room`);
    }

    private deleteGame(gameId: string) {
        if (!this.lobbyManagerService.isLobbyCreated(gameId)) {
            return;
        }
        const roomId = this.lobbyManagerService.getRoomId(gameId);
        const hostSocket = this.getSocketFromId(this.lobbyManagerService.getHostPlayer(gameId).id);
        this.server.to(roomId).emit(LobbyEvents.Alert, GAME_DELETED_MESSAGE);
        hostSocket.leave(roomId);

        const guestSocket = this.getSocketFromId(this.lobbyManagerService.getGuestPlayer(gameId)?.id);
        if (guestSocket) {
            guestSocket.leave(roomId);
        }
        this.lobbyManagerService.deleteLobby(gameId);
    }

    private subscribeToLobbyEvents() {
        this.listGameService.gameDeletedObservable.subscribe((gameId: string) => {
            this.server.to(this.serverRoom).emit(LobbyEvents.StatusChanged);
            this.deleteGame(gameId);
        });
        this.scoreService.scoreUpdatedObservable.subscribe(() => {
            this.server.to(this.serverRoom).emit(LobbyEvents.StatusChanged);
        });

        this.gameCreationService.gameCreatedObservable.subscribe(() => {
            this.server.to(this.serverRoom).emit(LobbyEvents.StatusChanged);
        });
    }

    private getSocketFromId(socketId: string): Socket {
        return this.server.sockets.sockets.get(socketId);
    }

    private updateGameStatus(gameId: string, isWaiting: boolean) {
        this.listGameService.setGameStatus(gameId, isWaiting);
        this.server.to(this.serverRoom).emit(LobbyEvents.StatusChanged);
    }

    private startMultiplayerGame(hostSocket: Socket, gameId: string) {
        this.lobbyManagerService.createMultiplayerGame(gameId);
    }

    private startSprintMultiplayerGame(socket: Socket, gameId: string) {
        this.lobbyManagerService.createMultiplayerSprintGame(gameId);
    }

    private startSoloGame(socket: Socket, soloRequest: PlayerRequest) {
        this.lobbyManagerService.createSoloGame(soloRequest, socket.id);
        this.server.to(socket.id).emit(GameEvents.PlayerNames, [soloRequest.playerName]);
    }

    private leaveFromHost(gameId: string) {
        const guestSocket = this.getSocketFromId(this.lobbyManagerService.getGuestPlayer(gameId)?.id);

        if (guestSocket) {
            guestSocket.emit(LobbyEvents.Alert, HOST_LEFT_MESSAGE);
            guestSocket.leave(this.lobbyManagerService.getRoomId(gameId));
        }
        this.lobbyManagerService.deleteLobby(gameId);
        this.updateGameStatus(gameId, false);
    }

    private getRandomGameId(): string {
        return [...this.listGameService.getGamesId()][Math.floor(Math.random() * this.listGameService.getGamesId().size)];
    }
}
