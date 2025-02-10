/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Timer } from '@app/classes/timer/timer';
import { GAME_DELETED_MESSAGE, LOBBY_FULL_MESSAGE } from '@app/constants/constant-server';
import { ScoreController } from '@app/controllers/score/score.controller';
import { Lobby } from '@app/interfaces/lobby';
import { Player } from '@app/interfaces/player';
import { PlayerType } from '@app/interfaces/player-type';
import { DatabaseService } from '@app/services/database/database.service';
import { GameCreationService } from '@app/services/game-creation/game-creation.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { ListGameService } from '@app/services/list-game/list-game.service';
import { LobbyManagerService } from '@app/services/lobby-manager/lobby-manager.service';
import { ScoreService } from '@app/services/score/score.service';
import { GameMode, GameType } from '@common/constants';
import { GameEvents } from '@common/events/game.events';
import { LobbyEvents } from '@common/events/lobby.events';
import { PlayerRequest } from '@common/interfaces/player-request';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { LobbyGateway } from './lobby.gateway';

const listGameServiceStub = {
    setGameStatus: () => {
        return;
    },
    gameDeletedObservable: of({}),
    getGamesId: () => {
        return new Set<string>(['1']);
    },
};

const gameCreationServiceStub = {
    gameCreatedObservable: of({}),
};

const scoreServiceStub = {
    scoreUpdatedObservable: of({}),
};

describe('LobbyGateway', () => {
    let gateway: LobbyGateway;
    let logger: SinonStubbedInstance<Logger>;
    let lobbyManagerService: SinonStubbedInstance<LobbyManagerService>;
    // let gameManagerService: SinonStubbedInstance<GameManagerService>;
    let playerRequest: PlayerRequest;
    let server: SinonStubbedInstance<Server>;
    let lobby: Lobby;
    let host: Player;
    let guest: Player;
    let timer: Timer;
    let socket: SinonStubbedInstance<Socket>;

    beforeEach(async () => {
        playerRequest = {
            gameId: '1',
            playerName: 'la',
        };
        logger = createStubInstance(Logger);
        lobbyManagerService = createStubInstance(LobbyManagerService);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LobbyGateway,
                { provide: Logger, useValue: logger },
                { provide: ListGameService, useValue: listGameServiceStub },
                { provide: LobbyManagerService, useValue: lobbyManagerService },
                { provide: GameManagerService, useValue: {} },
                { provide: ScoreService, useValue: scoreServiceStub },
                { provide: DatabaseService, useValue: {} },
                { provide: GameCreationService, useValue: gameCreationServiceStub },
            ],
            controllers: [ScoreController],
        }).compile();
        gateway = module.get<LobbyGateway>(LobbyGateway);
        gateway['server'] = server;
        playerRequest = {
            gameId: 'gameId',
            playerName: 'playerName',
        };
        host = {
            id: '1',
            score: 0,
            name: playerRequest.playerName,
            playerType: PlayerType.Host,
        };
        guest = {
            id: '2',
            score: 0,
            name: playerRequest.playerName,
            playerType: PlayerType.Guest,
        };
        lobby = {
            roomId: '1',
            gameId: 'randomGameId',
            host,
        };
        timer = new Timer();
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('after init should call subscribeToLobbyEvents', () => {
        const spy = jest.spyOn<any, any>(gateway, 'subscribeToLobbyEvents').mockReturnValue(void 0);
        gateway.afterInit();
        expect(spy).toHaveBeenCalled();
    });

    it('should emit events when observables change value', () => {
        stub(socket, 'rooms').value(new Set(['serverRoom']));
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway['subscribeToLobbyEvents']();
    });

    it('should emit events if lobby already exist', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                expect(event).toEqual(LobbyEvents.Alert);
            },
        } as BroadcastOperator<unknown, unknown>);

        const spy = jest.spyOn(lobbyManagerService, 'isLobbyCreated').mockReturnValue(true);
        gateway.createClassicLobby(socket, playerRequest);

        expect(spy).toHaveBeenCalled();
    });

    it('should create multiplayer sprint ', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);

        const spy = jest.spyOn(lobbyManagerService, 'isLobbyCreated').mockReturnValue(true);
        const spy2 = jest.spyOn(lobbyManagerService, 'getRoomId').mockReturnValue(lobby.roomId);
        const startMultiplayerSprintSpy = jest.spyOn<any, any>(gateway, 'startSprintMultiplayerGame');
        jest.spyOn<any, any>(gateway, 'getRandomGameId').mockReturnValue(playerRequest.gameId);

        gateway.createMultiplayerSprint(socket, playerRequest);

        expect(server.emit.calledWith(GameEvents.StartMultiplayerGame));
        expect(server.emit.calledWith(GameEvents.PlayerNames));
        expect(server.emit.calledWith(GameEvents.GameInfo));

        expect(spy).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
        expect(startMultiplayerSprintSpy).toHaveBeenCalled();
    });

    it('should create a lobby if lobby does not exist  ', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);

        const spy = jest.spyOn(lobbyManagerService, 'createLobby').mockReturnValue(lobby);
        const spy2 = jest.spyOn(listGameServiceStub, 'setGameStatus');
        gateway.createClassicLobby(socket, playerRequest);

        expect(socket.emit.calledWith(LobbyEvents.StatusChanged));
        expect(spy).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
    });

    it('should create multiplayer lobby for a sprint game ', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                expect(event).toEqual(LobbyEvents.Wait);
            },
        } as BroadcastOperator<unknown, unknown>);

        const spy = jest.spyOn(lobbyManagerService, 'createLobby').mockReturnValue(lobby);

        gateway.createMultiplayerSprint(socket, playerRequest);

        expect(spy).toHaveBeenCalled();
    });

    it('should start the game solo', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);

        lobbyManagerService.getTimerObservable.returns(timer.timerObservable);
        gateway.handleStartSolo(socket, playerRequest);
        expect(socket.emit.calledWith(GameEvents.GameInfo, { gameId: playerRequest.gameId, mode: GameMode.Classic, type: GameType.Solo }));
    });

    it('should start the game solo for sprint ', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);

        jest.spyOn<any, any>(gateway, 'getRandomGameId').mockReturnValue(playerRequest.gameId);

        const spy = jest.spyOn(lobbyManagerService, 'createSoloSprintGame');
        gateway.createSoloSprint(socket, host.name);

        expect(server.emit.calledWith(GameEvents.PlayerNames));
        expect(spy).toHaveBeenCalled();
        expect(server.emit.calledWith(GameEvents.GameInfo));
    });

    it('should join guest with host', () => {
        socket.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);
        jest.spyOn(lobbyManagerService, 'isLobbyCreated').mockReturnValue(true);
        gateway.joinLobby(socket, playerRequest);
        expect(socket.emit.calledWith(LobbyEvents.RequestToJoin));
    });
    it('should not join guest with host if lobby is not created', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);
        jest.spyOn(lobbyManagerService, 'isLobbyCreated').mockReturnValue(false);
        gateway.joinLobby(socket, playerRequest);
        expect(socket.emit.calledWith(LobbyEvents.Alert));
    });
    it('should not join guest if lobby is full', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);
        socket.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                expect(event).toEqual(LobbyEvents.Alert);
            },
        } as BroadcastOperator<unknown, unknown>);
        jest.spyOn(lobbyManagerService, 'isLobbyCreated').mockReturnValue(true);
        jest.spyOn(lobbyManagerService, 'getGuestPlayer').mockReturnValue(guest);
        gateway.joinLobby(socket, playerRequest);
        expect(socket.emit.calledWith(LobbyEvents.Alert, LOBBY_FULL_MESSAGE));
    });
    it('reject player should remove guest ', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                expect(event).toEqual(LobbyEvents.StatusChanged);
            },
        } as BroadcastOperator<unknown, unknown>);
        socket.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                expect(event).toEqual(LobbyEvents.Alert);
            },
        } as BroadcastOperator<unknown, unknown>);
        jest.spyOn(lobbyManagerService, 'getGuestPlayer').mockReturnValue(guest);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn<any, any>(gateway, 'getSocketFromId').mockReturnValue(socket);
        const spy = jest.spyOn(lobbyManagerService, 'removeGuestPlayer');
        gateway.rejectPlayer(socket, playerRequest.gameId);
        expect(spy).toHaveBeenCalled();
    });
    it('acceptPlayer should updateGameStatus and start multiplayer game ', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);

        const getRoomId = jest.spyOn(lobbyManagerService, 'getRoomId').mockReturnValue(lobby.roomId);
        const setGameStatus = jest.spyOn(listGameServiceStub, 'setGameStatus');
        lobbyManagerService.getTimerObservable.returns(timer.timerObservable);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn<any, any>(gateway, 'getSocketFromId').mockReturnValue(socket);
        const multiplayerSpy = jest.spyOn(lobbyManagerService, 'createMultiplayerGame');
        gateway.acceptPlayer(socket, playerRequest.gameId);
        expect(getRoomId).toHaveBeenCalled();
        expect(setGameStatus).toHaveBeenCalled();
        expect(multiplayerSpy).toHaveBeenCalled();
        expect(socket.emit.calledWith(LobbyEvents.StatusChanged));
    });
    it('leaveLobby should make the host leave the lobby ', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                expect(event).toEqual(LobbyEvents.StatusChanged);
            },
        } as BroadcastOperator<unknown, unknown>);

        host.id = socket.id;
        jest.spyOn(lobbyManagerService, 'getGameIdFromPlayerId').mockReturnValue(playerRequest.gameId);
        jest.spyOn(lobbyManagerService, 'getHostPlayer').mockReturnValue(host);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn<any, any>(gateway, 'getSocketFromId').mockReturnValue(socket);
        const deleteLobby = jest.spyOn(lobbyManagerService, 'deleteLobby');
        const setGameStatus = jest.spyOn(listGameServiceStub, 'setGameStatus');

        gateway.leaveLobby(socket);
        expect(deleteLobby).toHaveBeenCalled();
        expect(setGameStatus).toHaveBeenCalled();
        expect(socket.emit.calledWith(LobbyEvents.StatusChanged));
    });
    it('leaveLobby should make the guest leave the lobby ', () => {
        socket.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                expect(event).toEqual(LobbyEvents.Left);
            },
        } as BroadcastOperator<unknown, unknown>);

        jest.spyOn(lobbyManagerService, 'getGameIdFromPlayerId').mockReturnValue(playerRequest.gameId);
        jest.spyOn(lobbyManagerService, 'getHostPlayer').mockReturnValue(host);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn<any, any>(gateway, 'getSocketFromId').mockReturnValue(socket);
        const removeGuestPlayer = jest.spyOn(lobbyManagerService, 'removeGuestPlayer');

        gateway.leaveLobby(socket);
        expect(removeGuestPlayer).toHaveBeenCalled();
        expect(socket.emit.calledWith(LobbyEvents.Left));
    });
    it('deleteGame should not delete a game that doesnt exist ', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                expect(event).not.toEqual(LobbyEvents.Alert);
            },
        } as BroadcastOperator<unknown, unknown>);
        jest.spyOn(lobbyManagerService, 'isLobbyCreated').mockReturnValue(false);
        gateway['deleteGame'](playerRequest.gameId);
    });

    it('deleteGame should delete the game ', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);
        jest.spyOn(lobbyManagerService, 'isLobbyCreated').mockReturnValue(true);
        const getRoomId = jest.spyOn(lobbyManagerService, 'getRoomId').mockReturnValue(lobby.roomId);
        jest.spyOn(lobbyManagerService, 'getGuestPlayer').mockReturnValue(guest);
        jest.spyOn(lobbyManagerService, 'getHostPlayer').mockReturnValue(host);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn<any, any>(gateway, 'getSocketFromId').mockReturnValue(socket);
        const deleteLobby = jest.spyOn(lobbyManagerService, 'deleteLobby');
        gateway['deleteGame'](playerRequest.gameId);
        expect(getRoomId).toHaveBeenCalled();
        expect(deleteLobby).toHaveBeenCalled();
        expect(socket.emit.calledWith(LobbyEvents.StatusChanged));
        expect(socket.emit.calledWith(LobbyEvents.Alert, GAME_DELETED_MESSAGE));
    });

    it('connections and disconnects should be logged', () => {
        gateway.handleConnection(socket);
        expect(logger.log.callCount).toBe(1);

        gateway.handleDisconnect(socket);
        expect(logger.log.callCount).toBe(2);
    });

    it('random game Id should return randomId', () => {
        expect(gateway['getRandomGameId']()).toEqual('1');
    });
});
