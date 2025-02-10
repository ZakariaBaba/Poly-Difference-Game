/* eslint-disable @typescript-eslint/no-explicit-any */
import { Game } from '@app/classes/game/game';
import { MultiplayerGame } from '@app/classes/game/multiplayer-game';
import { Lobby } from '@app/interfaces/lobby';
import { PlayerType } from '@app/interfaces/player-type';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { GameType, Position } from '@common/constants';
import { Difference } from '@common/interfaces/difference';
import { Message, MessageType } from '@common/interfaces/message';
import { ConstantParameter } from '@common/interfaces/public-game';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';

describe('ChatService', () => {
    let service: ChatService;
    let gameManagerService: SinonStubbedInstance<GameManagerService>;
    let objectMulti: Game;
    let expectedDifferences: Difference[];
    let lobby: Lobby;
    let testRoomId: string;
    let testConstants: ConstantParameter;
    let socket: SinonStubbedInstance<Socket>;

    beforeEach(async () => {
        gameManagerService = createStubInstance(GameManagerService);
        socket = createStubInstance<Socket>(Socket);
        const module: TestingModule = await Test.createTestingModule({
            providers: [ChatService, { provide: GameManagerService, useValue: gameManagerService }],
        }).compile();

        testRoomId = 'gameId';
        lobby = {
            roomId: testRoomId,
            gameId: testRoomId,
            host: { id: 'testId', name: 'testName', score: 0, playerType: PlayerType.Host },
            guest: { id: 'testId2', name: 'testName2', score: 0, playerType: PlayerType.Guest },
        };
        testConstants = {
            totalTime: 100,
            timeWon: 10,
            penalty: 10,
        };
        expectedDifferences = [
            {
                pixelsPosition: [
                    { x: 0, y: 0 },
                    { x: 1, y: 1 },
                ],
            },
            {
                pixelsPosition: [
                    { x: 2, y: 2 },
                    { x: 3, y: 3 },
                ],
            },
        ];
        objectMulti = new MultiplayerGame(
            {
                differences: expectedDifferences,
                constants: testConstants,
                name: 'testGameName',
            },
            lobby,
        );

        service = module.get<ChatService>(ChatService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('formatPlayerMessage should return a formatted message', () => {
        jest.spyOn<any, any>(service, 'getPlayerType').mockReturnValue(MessageType.Host);
        jest.spyOn<any, any>(gameManagerService, 'getPlayerName').mockReturnValue('testName');
        const expectedMessage = {
            content: 'test',
            time: new Date().toLocaleTimeString('it-IT'),
            type: MessageType.Host,
            name: 'testName',
        } as Message;
        expect(service.formatPlayerMessage('test', socket)).toStrictEqual(expectedMessage);
    });

    it('formatSystemMessage should return a formatted message', () => {
        const expectedMessage = {
            content: 'test',
            time: new Date().toLocaleTimeString('it-IT'),
            type: MessageType.System,
            name: MessageType.System,
        } as Message;
        expect(service.formatSystemMessage('test')).toStrictEqual(expectedMessage);
    });

    it('formatNewRecordMessage in solo should return a formatted message', () => {
        const testEndGameResult = {
            gameType: GameType.Solo,
            gameId: 'testId',
            gameName: 'testGameName',
            score: {
                playerName: 'testName',
                timeInSeconds: 10,
            },
            position: 2,
        };
        const expectedMessage = {
            content: 'testName obtient la deuxième place dans les meilleurs temps du jeu testGameName en solo',
            time: new Date().toLocaleTimeString('it-IT'),
            type: MessageType.System,
            name: MessageType.System,
        } as Message;
        expect(service.formatNewRecordMessage(testEndGameResult)).toStrictEqual(expectedMessage);
    });

    it('formatNewRecordMessage in multiplayer should return a formatted message', () => {
        const testEndGameResult = {
            gameType: GameType.Multiplayer,
            gameId: 'testId',
            gameName: 'testGameName',
            score: {
                playerName: 'testName',
                timeInSeconds: 10,
            },
            position: 2,
        };
        const expectedMessage = {
            content: 'testName obtient la deuxième place dans les meilleurs temps du jeu testGameName en un contre un',
            time: new Date().toLocaleTimeString('it-IT'),
            type: MessageType.System,
            name: MessageType.System,
        } as Message;
        expect(service.formatNewRecordMessage(testEndGameResult)).toStrictEqual(expectedMessage);
    });

    it('getRoomId should return the room Id of the socket', () => {
        gameManagerService.getRoomId.returns('test');
        expect(service.getRoomId(socket)).toBe('test');
    });

    it('getPlayerType should return MessageType.Guest', () => {
        const spy = jest.spyOn(gameManagerService, 'getRoomId');
        spy.mockReturnValue('1');
        (socket.id as unknown) = 'testId';
        const spy2 = jest.spyOn(gameManagerService, 'getMultiplayerGame').mockReturnValue(undefined);
        const result = service['getPlayerType'](socket);
        expect(spy2).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
        expect(result).toBe(MessageType.Guest);
    });

    it('getPlayerType should return MessageType.Host', () => {
        const spy = jest.spyOn(gameManagerService, 'getRoomId');
        spy.mockReturnValue('1');
        const spy2 = jest.spyOn(gameManagerService, 'getMultiplayerGame').mockReturnValue(objectMulti as MultiplayerGame);
        (socket.id as unknown) = 'testId';
        const result = service['getPlayerType'](socket);
        expect(spy2).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
        expect(result).toBe(MessageType.Host);
    });

    it('getPositionInString should return the right position', () => {
        expect(service['getPositionInString'](1)).toBe(Position.First);
        expect(service['getPositionInString'](2)).toBe(Position.Second);
        expect(service['getPositionInString'](3)).toBe(Position.Third);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(service['getPositionInString'](9999)).toBe('');
    });
});
