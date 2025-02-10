import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { PlayerRequest } from '@common/interfaces/player-request';

import { GameEvents } from '@common/events/game.events';
import { LobbyEvents } from '@common/events/lobby.events';
import { Subject } from 'rxjs';
import { Socket } from 'socket.io-client';
import { LobbyService } from './lobby.service';

describe('LobbyService', () => {
    let service: LobbyService;
    let socketServiceMock: SocketClientService;
    let socketHelper: SocketTestHelper;
    let playerRequest: PlayerRequest;

    beforeEach(() => {
        playerRequest = {
            gameId: '1',
            playerName: 'la',
        };
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientService();
        socketServiceMock.socket = socketHelper as unknown as Socket;

        TestBed.configureTestingModule({
            providers: [{ provide: SocketClientService, useValue: socketServiceMock }],
        });
        service = TestBed.inject(LobbyService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('connectSocket should connect the socket if the socket isnt alive', () => {
        socketServiceMock.socket.connected = false;
        service.connectSocket();
        expect(socketServiceMock.isSocketAlive).toBeTruthy();
    });
    it('initialize should call connectSocket and listenLobbyEvent', () => {
        const connectSocketSpy = spyOn(service, 'connectSocket');
        const listenLobbyEventSpy = spyOn(service, 'listenLobbyEvent');
        service.initialize();
        expect(connectSocketSpy).toHaveBeenCalled();
        expect(listenLobbyEventSpy).toHaveBeenCalled();
    });

    it('listenLobbyEvent shoud update status', () => {
        service.listenLobbyEvent();
        const spy = spyOn<Subject<boolean>>(service['wait$'], 'next').and.callThrough();
        socketHelper.peerSideEmit(LobbyEvents.Wait, true);
        expect(spy).toHaveBeenCalledWith(true);
    });

    it('listenLobbyEvent shoud update status', () => {
        service.listenLobbyEvent();
        const spy = spyOn<Subject<boolean>>(service['statusChanged$'], 'next').and.callThrough();
        socketHelper.peerSideEmit(LobbyEvents.StatusChanged, true);
        expect(spy).toHaveBeenCalledWith(true);
    });
    it('listenLobbyEvent shoud update player request', () => {
        service.listenLobbyEvent();
        const spy = spyOn<Subject<PlayerRequest>>(service['playerRequest$'], 'next').and.callThrough();
        socketHelper.peerSideEmit(LobbyEvents.RequestToJoin, playerRequest);
        expect(spy).toHaveBeenCalledWith(playerRequest);
    });
    it('listenLobbyEvent shoud update player request', () => {
        service.listenLobbyEvent();
        const spy = spyOn<Subject<boolean>>(service['gameCreated$'], 'next').and.callThrough();
        socketHelper.peerSideEmit(GameEvents.StartMultiplayerGame);
        expect(spy).toHaveBeenCalledWith(true);
    });
    it('listenLobbyEvent shoud update player that left', () => {
        service.listenLobbyEvent();
        const spy = spyOn<Subject<boolean>>(service['playerLeft$'], 'next').and.callThrough();
        socketHelper.peerSideEmit(LobbyEvents.Left, true);
        expect(spy).toHaveBeenCalledWith(true);
    });

    it('listenLobbyEvent shoud update when game is deleted', () => {
        const message = '2';
        service.listenLobbyEvent();
        const spy = spyOn<Subject<string>>(service['lobbyAlert$'], 'next').and.callThrough();
        socketHelper.peerSideEmit(LobbyEvents.Alert, message);
        expect(spy).toHaveBeenCalledWith(message);
    });

    it('listenLobbyEvent shoud update when lobby is full', () => {
        const message = '2';
        service.listenLobbyEvent();
        const spy = spyOn<Subject<string>>(service['lobbyAlert$'], 'next').and.callThrough();
        socketHelper.peerSideEmit(LobbyEvents.Alert, message);
        expect(spy).toHaveBeenCalledWith(message);
    });

    it('startSoloSprintGame should send a socket when a lobby is created', () => {
        const startSoloSprintGameSpy = spyOn(service['socketClientService'], 'send').and.callThrough();
        socketHelper.peerSideEmit(LobbyEvents.CreateSoloSprint, playerRequest);
        service.startSoloSprintGame('gh');
        expect(startSoloSprintGameSpy).toHaveBeenCalled();
    });

    it('createSprintLobby should send a socket when a lobby is created', () => {
        const createSprintLobbySpy = spyOn(service['socketClientService'], 'send').and.callThrough();
        socketHelper.peerSideEmit(LobbyEvents.CreateMultiplayerSprint, playerRequest);
        service.createSprintLobby('gh');
        expect(createSprintLobbySpy).toHaveBeenCalled();
    });

    it('createLobby should send a socket when a lobby is created', () => {
        const createLobbySpy = spyOn(service['socketClientService'], 'send').and.callThrough();
        socketHelper.peerSideEmit(LobbyEvents.Create, playerRequest);
        service.createLobby(playerRequest);
        expect(createLobbySpy).toHaveBeenCalled();
    });

    it('leaveLobby should send a socket when a player leaves a lobby', () => {
        const leaveLobbySpy = spyOn(service['socketClientService'], 'send').and.callThrough();
        socketHelper.peerSideEmit(LobbyEvents.LeaveLobby);
        service.leaveLobby();
        expect(leaveLobbySpy).toHaveBeenCalled();
    });
    it('joinLobby should send a socket when a lobby is joined', () => {
        const joinLobbySpy = spyOn(service['socketClientService'], 'send').and.callThrough();
        socketHelper.peerSideEmit(LobbyEvents.Join, playerRequest);
        service.joinLobby(playerRequest);
        expect(joinLobbySpy).toHaveBeenCalled();
    });
    it('acceptPlayer should send a socket when a player accept an invitation', () => {
        const gameId = '2';
        const acceptPlayerSpy = spyOn(service['socketClientService'], 'send').and.callThrough();
        socketHelper.peerSideEmit(LobbyEvents.Accepted, gameId);
        service.acceptPlayer(gameId);
        expect(acceptPlayerSpy).toHaveBeenCalled();
    });
    it('rejectPlayer should send a socket when a player reject an invitation', () => {
        const gameId = '2';
        const rejectPlayerSpy = spyOn(service['socketClientService'], 'send').and.callThrough();
        socketHelper.peerSideEmit(LobbyEvents.Reject, gameId);
        service.rejectPlayer(gameId);
        expect(rejectPlayerSpy).toHaveBeenCalled();
    });
    it('startSoloGame should send a socket when a player reject an invitation', () => {
        const startSoloGameSpy = spyOn(service['socketClientService'], 'send').and.callThrough();
        socketHelper.peerSideEmit(LobbyEvents.StartSolo, playerRequest);
        service.startSoloGame(playerRequest);
        expect(startSoloGameSpy).toHaveBeenCalled();
    });

    it('connectSocket should connect the socket if the socket isnt alive', () => {
        socketServiceMock.socket.connected = false;
        service.connectSocket();
        expect(socketServiceMock.isSocketAlive).toBeTruthy();
    });
    it('initialize should call connectSocket and listenLobbyEvent', () => {
        const connectSocketSpy = spyOn(service, 'connectSocket');
        const listenLobbyEventSpy = spyOn(service, 'listenLobbyEvent');
        service.initialize();
        expect(connectSocketSpy).toHaveBeenCalled();
        expect(listenLobbyEventSpy).toHaveBeenCalled();
    });
    it('listenLobbyEvent shoud update status', () => {
        service.listenLobbyEvent();
        const spy = spyOn<Subject<boolean>>(service['statusChanged$'], 'next').and.callThrough();
        socketHelper.peerSideEmit(LobbyEvents.StatusChanged, true);
        expect(spy).toHaveBeenCalledWith(true);
    });
    it('listenLobbyEvent shoud update player request', () => {
        service.listenLobbyEvent();
        const spy = spyOn<Subject<PlayerRequest>>(service['playerRequest$'], 'next').and.callThrough();
        socketHelper.peerSideEmit(LobbyEvents.RequestToJoin, playerRequest);
        expect(spy).toHaveBeenCalledWith(playerRequest);
    });

    it('listenLobbyEvent shoud update player that left', () => {
        service.listenLobbyEvent();
        const spy = spyOn<Subject<boolean>>(service['playerLeft$'], 'next').and.callThrough();
        socketHelper.peerSideEmit(LobbyEvents.Left, true);
        expect(spy).toHaveBeenCalledWith(true);
    });
    it('listenLobbyEvent shoud update when game is deleted', () => {
        const message = '2';
        service.listenLobbyEvent();
        const spy = spyOn<Subject<string>>(service['lobbyAlert$'], 'next').and.callThrough();
        socketHelper.peerSideEmit(LobbyEvents.Alert, message);
        expect(spy).toHaveBeenCalledWith(message);
    });
    it('listenLobbyEvent shoud update when lobby is full', () => {
        const message = '2';
        service.listenLobbyEvent();
        const spy = spyOn<Subject<string>>(service['lobbyAlert$'], 'next').and.callThrough();
        socketHelper.peerSideEmit(LobbyEvents.Alert, message);
        expect(spy).toHaveBeenCalledWith(message);
    });
    it('createLobby should send a socket when a lobby is created', () => {
        const createLobbySpy = spyOn(service['socketClientService'], 'send').and.callThrough();
        socketHelper.peerSideEmit(LobbyEvents.Create, playerRequest);
        service.createLobby(playerRequest);
        expect(createLobbySpy).toHaveBeenCalled();
    });

    it('leaveLobby should send a socket when a player leaves a lobby', () => {
        const leaveLobbySpy = spyOn(service['socketClientService'], 'send').and.callThrough();
        socketHelper.peerSideEmit(LobbyEvents.LeaveLobby);
        service.leaveLobby();
        expect(leaveLobbySpy).toHaveBeenCalled();
    });
    it('joinLobby should send a socket when a lobby is joined', () => {
        const joinLobbySpy = spyOn(service['socketClientService'], 'send').and.callThrough();
        socketHelper.peerSideEmit(LobbyEvents.Join, playerRequest);
        service.joinLobby(playerRequest);
        expect(joinLobbySpy).toHaveBeenCalled();
    });
    it('acceptPlayer should send a socket when a player accept an invitation', () => {
        const gameId = '2';
        const acceptPlayerSpy = spyOn(service['socketClientService'], 'send').and.callThrough();
        socketHelper.peerSideEmit(LobbyEvents.Accepted, gameId);
        service.acceptPlayer(gameId);
        expect(acceptPlayerSpy).toHaveBeenCalled();
    });
    it('rejectPlayer should send a socket when a player reject an invitation', () => {
        const gameId = '2';
        const rejectPlayerSpy = spyOn(service['socketClientService'], 'send').and.callThrough();
        socketHelper.peerSideEmit(LobbyEvents.Reject, gameId);
        service.rejectPlayer(gameId);
        expect(rejectPlayerSpy).toHaveBeenCalled();
    });
    it('startSoloGame should send a socket when a player reject an invitation', () => {
        const startSoloGameSpy = spyOn(service['socketClientService'], 'send').and.callThrough();
        socketHelper.peerSideEmit(LobbyEvents.StartSolo, playerRequest);
        service.startSoloGame(playerRequest);
        expect(startSoloGameSpy).toHaveBeenCalled();
    });
});
