/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { DifferencesService } from '@app/services/differences/differences.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { TimerService } from '@app/services/timer/timer.service';
import { GameMode, GameType } from '@common/constants';
import { GameEvents } from '@common/events/game.events';
import { DifferencesCount } from '@common/interfaces/differences-count';
import { GameInfo } from '@common/interfaces/game-info';
import { ConstantParameter } from '@common/interfaces/public-game';
import { Observable, Subject } from 'rxjs';
import { Socket } from 'socket.io-client';
import SpyObj = jasmine.SpyObj;
describe('GameManagerService', () => {
    let service: GameManagerService;
    let socketHelper: SocketTestHelper;
    let gameEvents: GameEvents;
    let timerServiceSpy: SpyObj<TimerService>;
    let differenceServiceSpy: SpyObj<DifferencesService>;
    let testObservable: Observable<DifferencesCount>;
    let socketService: SocketClientService;
    let gameInfo: GameInfo;

    beforeEach(() => {
        gameEvents = {
            gameId: '1',
            playerNames: ['a', 's'],
            gameFinished: 'gameFinished',
        } as unknown as GameEvents;

        gameInfo = {
            gameId: 'string',
            mode: GameMode.Classic,
            type: GameType.Solo,
        };

        socketHelper = new SocketTestHelper();
        timerServiceSpy = jasmine.createSpyObj('TimerService', ['listenTimerEvent', 'startTimer', 'stopTimer']);
        differenceServiceSpy = jasmine.createSpyObj('DifferencesService', ['listenDifferenceEvents']);
        socketService = new SocketClientService();
        socketService.socket = socketHelper as unknown as Socket;
        socketService.isSocketAlive = () => {
            return true;
        };
        TestBed.configureTestingModule({
            providers: [
                { provide: SocketClientService, useValue: socketService },
                { provide: DifferencesService, useValue: differenceServiceSpy },
                { provide: TimerService, useValue: timerServiceSpy },
            ],
        });
        service = TestBed.inject(GameManagerService);
    });

    it('continueSolo', () => {
        const socketServiceSpy = spyOn(service['socketClientService'], 'send');
        service.continueSolo();
        expect(socketServiceSpy).toHaveBeenCalled();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getter should return the difference count observable', () => {
        differenceServiceSpy.differenceCountObservable = testObservable;
        expect(service.differenceCountObservable).toEqual(testObservable);
    });

    it('initialize should connect the socket, create the game and listen for services events', () => {
        service.initialize();
        expect(timerServiceSpy.listenTimerEvent).toHaveBeenCalled();
        expect(differenceServiceSpy.listenDifferenceEvents).toHaveBeenCalled();
    });

    it('checkGameStatus should', () => {
        service.checkGameStatus();
        const gameCreatedSpy = spyOn<Subject<boolean>>(service['gameCreated$'], 'next').and.callThrough();
        socketHelper.peerSideEmit(GameEvents.GameStatus, true);
        expect(gameCreatedSpy).toHaveBeenCalledWith(true);
    });

    it('listenGameEvents should ', () => {
        service.listenGameEvents();
        const playerNamesSpy = spyOn<Subject<ConstantParameter>>(service['gameConstants$'], 'next').and.callThrough();
        socketHelper.peerSideEmit(GameEvents.Constant, gameEvents);
        expect(playerNamesSpy).toHaveBeenCalledWith(gameEvents);
    });

    it('listenGameEvents should update players name', () => {
        service.listenGameEvents();
        const playerNamesSpy = spyOn<Subject<[string, string]>>(service['playerNames$'], 'next').and.callThrough();
        socketHelper.peerSideEmit(GameEvents.PlayerNames, gameEvents);
        expect(playerNamesSpy).toHaveBeenCalledWith(gameEvents);
    });

    it('listenGameEvents should update players name', () => {
        service.listenGameEvents();
        const gameInfoSpy = spyOn<Subject<GameInfo>>(service['gameInfo$'], 'next').and.callThrough();
        socketHelper.peerSideEmit(GameEvents.GameInfo, gameInfo);
        expect(gameInfoSpy).toHaveBeenCalledWith(gameInfo);
    });

    it('endGameEvents should update endGameMessage', () => {
        service.endGameEvents();

        const endGameMessageSpy = spyOn<Subject<string>>(service['endGameMessage$'], 'next').and.callThrough();
        const playerLeftSpy = spyOn<Subject<string>>(service['playerLeft$'], 'next').and.callThrough();

        socketHelper.peerSideEmit(GameEvents.GameFinished, gameEvents);
        socketHelper.peerSideEmit(GameEvents.PlayerLeft, gameEvents);

        expect(endGameMessageSpy).toHaveBeenCalledWith(gameEvents);
        expect(playerLeftSpy).toHaveBeenCalledWith(gameEvents);
    });

    it('endGameEvents should update endGameMessage', () => {
        service.endGameEvents();
        const endGameMessageSpy = spyOn<Subject<string>>(service['playerLeft$'], 'next').and.callThrough();
        socketHelper.peerSideEmit(GameEvents.PlayerLeft, gameEvents);

        expect(endGameMessageSpy).toHaveBeenCalledWith(gameEvents);
    });

    it('leaveGame should send the Game event leaveGame', () => {
        const socketServiceSpy = spyOn(service['socketClientService'], 'send');
        service.leaveGame();
        expect(socketServiceSpy).toHaveBeenCalled();
    });

    it('disconnect should call socket service disconnect', () => {
        const socketServiceSpy = spyOn(service['socketClientService'], 'disconnect');
        service.disconnect();
        expect(socketServiceSpy).toHaveBeenCalled();
    });

    it('disconnect should call socket service disconnect', () => {
        const socketServiceSpy = spyOn(service['socketClientService'], 'send');
        service.continueSolo();
        expect(socketServiceSpy).toHaveBeenCalled();
    });
});
