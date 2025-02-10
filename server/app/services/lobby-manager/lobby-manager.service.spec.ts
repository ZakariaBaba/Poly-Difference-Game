/* eslint-disable @typescript-eslint/no-explicit-any */
import { Lobby } from '@app/interfaces/lobby';
import { Player } from '@app/interfaces/player';
import { PlayerType } from '@app/interfaces/player-type';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { PlayerRequest } from '@common/interfaces/player-request';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { LobbyManagerService } from './lobby-manager.service';
describe('LobbyManagerService', () => {
    let service: LobbyManagerService;
    let gameManagerService: SinonStubbedInstance<GameManagerService>;
    let request: PlayerRequest;
    let host: Player;
    let guest: Player;
    let lobby: Lobby;
    beforeEach(async () => {
        gameManagerService = createStubInstance(GameManagerService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [LobbyManagerService, { provide: GameManagerService, useValue: gameManagerService }],
        }).compile();

        service = module.get<LobbyManagerService>(LobbyManagerService);
        request = {
            gameId: 'gameId',
            playerName: 'playerName',
        };
        host = {
            id: '1',
            score: 0,
            name: request.playerName,
            playerType: PlayerType.Host,
        };
        guest = {
            id: '2',
            score: 0,
            name: request.playerName,
            playerType: PlayerType.Guest,
        };
        lobby = {
            roomId: '1',
            gameId: 'randomGameId',
            host,
        };
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a lobby', () => {
        const hostSocketId = 'hostSocketId';
        const createdLobby = service.createLobby(request, hostSocketId);
        expect(createdLobby).toBeDefined();
        expect(createdLobby.roomId).toBeDefined();
        expect(createdLobby.host).toBeDefined();
        expect(createdLobby.host.id).toEqual(hostSocketId);
        expect(createdLobby.host.name).toEqual(request.playerName);
    });

    it('should return true if lobby is created', () => {
        service['lobbies'].set(request.gameId, lobby);
        expect(service.isLobbyCreated(request.gameId)).toBeTruthy();
    });

    it('getPlayerName should get  1 player name', () => {
        const gameLobby: Lobby = {
            roomId: '1',
            gameId: 'randomGameId',
            host,
        };
        service['lobbies'].set(request.gameId, gameLobby);
        expect(service.getPlayerNames(request.gameId)).toEqual([host.name, undefined]);
    });

    it('getPlayerName should get the players name', () => {
        const gameLobby: Lobby = {
            roomId: '1',
            gameId: 'randomGameId',
            host,
            guest,
        };
        service['lobbies'].set(request.gameId, gameLobby);
        expect(service.getPlayerNames(request.gameId)).toEqual([host.name, guest.name]);
    });

    it('getRoomId should get the room id', () => {
        expect(service.getRoomId(request.gameId)).toBeUndefined();

        service['lobbies'].set(request.gameId, lobby);
        expect(service.getRoomId(request.gameId)).toEqual(lobby.roomId);
    });

    it('getHostplayer and getGuestPlayer return undefined ', () => {
        expect(service.getHostPlayer(request.gameId)).toBeUndefined();
        expect(service.getGuestPlayer(request.gameId)).toBeUndefined();
    });

    it('getGameIdFromPlayerId should get the game id', () => {
        service['lobbies'].set(request.gameId, lobby);
        const gameId = service.getGameIdFromPlayerId(host.id);
        expect(gameId).toEqual(request.gameId);
    });

    it('getGameIdFromPlayerId should return undefined', () => {
        const gameId = service.getGameIdFromPlayerId(host.id);
        expect(gameId).toBeUndefined();
    });

    it('setGuestPlayer should set the guest', () => {
        service['lobbies'].set(request.gameId, lobby);
        service.setGuestPlayer(request, guest.id);
        expect(service['lobbies'].get(request.gameId).guest).toEqual(guest);
    });

    it('removeGuestPlayer should remove the guest', () => {
        service['lobbies'].set(request.gameId, lobby);
        service.removeGuestPlayer(request.gameId);
        expect(service['lobbies'].get(request.gameId).guest).toBeUndefined();
    });

    it('deleteLobby should remove the lobby', () => {
        service['lobbies'].set(request.gameId, lobby);
        service.deleteLobby(request.gameId);
        expect(service['lobbies'].get(request.gameId)).toBeUndefined();
    });

    it('createMultiplayerGame should call gameManagerService', () => {
        const spy = jest.spyOn(gameManagerService, 'createSprintGame');
        service['lobbies'].set(request.gameId, lobby);
        service.createMultiplayerSprintGame(request.gameId);
        expect(spy).toHaveBeenCalled();
    });

    it('createMultiplayerSprintGame should call gameManagerService', () => {
        const spy = jest.spyOn(gameManagerService, 'createMultiplayerGame');
        service['lobbies'].set(request.gameId, lobby);
        service.createMultiplayerGame(request.gameId);
        expect(spy).toHaveBeenCalled();
    });

    it('createSoloSprintGame should call gameManagerService', () => {
        const spy = jest.spyOn(gameManagerService, 'createSprintGame');
        service['lobbies'].set(request.gameId, lobby);
        service.createSoloSprintGame(request.gameId, lobby);
        expect(spy).toHaveBeenCalled();
    });

    it('createSoloGame should call gameManagerService', () => {
        const spy = jest.spyOn(gameManagerService, 'createSoloGame');
        service['lobbies'].set(request.gameId, lobby);
        service.createSoloGame(request, lobby.host.id);
        expect(spy).toHaveBeenCalled();
    });

    it('getTimerObservable should call timerService', () => {
        const spy = jest.spyOn(gameManagerService, 'getTimerObservable');
        service['lobbies'].set(request.gameId, lobby);
        service.getTimerObservable('1');
        expect(spy).toHaveBeenCalled();
    });
});
