/* eslint-disable max-lines */
import { Game } from '@app/classes/game/game';
import { MultiplayerGame } from '@app/classes/game/multiplayer-game';
import { SoloGame } from '@app/classes/game/solo-game';
import { SprintGame } from '@app/classes/game/sprint-game';
import { ENCODING, JSON_EXT, JSON_PATH, RELATIVE_PATH_TO_DIFFERENCES } from '@app/constants/constant-server';
import { Lobby } from '@app/interfaces/lobby';
import { PlayerType } from '@app/interfaces/player-type';
import { GameDataDto } from '@app/model/dto/game-data.dto';
import { ListGameService } from '@app/services/list-game/list-game.service';
import { GameMode } from '@common/constants';
import { Difference } from '@common/interfaces/difference';
import { PlayerRequest } from '@common/interfaces/player-request';
import { ConstantParameter } from '@common/interfaces/public-game';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import { of } from 'rxjs';
import { GameManagerService } from './game-manager.service';

jest.mock('fs', () => ({
    // eslint-disable-next-line no-unused-vars
    readFileSync: jest.fn((fileName: string) => {
        return JSON.stringify(testDifferences);
    }),
}));

const listGameServiceStub = {
    setGameStatus: () => {
        return;
    },
    getGamesId: () => {
        return of(['testGameId']);
    },
    gameDeletedObservable: of({}),
};

const testDifferences: Difference[] = [{ pixelsPosition: [{ x: 12, y: 2 }] }, { pixelsPosition: [{ x: 12, y: 2 }] }];
describe('DifferencesService', () => {
    let service: GameManagerService;
    let playerRequest: PlayerRequest;
    let testRoomId: string;
    let testGameCardId: string;
    let lobby: Lobby;
    let testConstants: ConstantParameter;

    beforeEach(async () => {
        testRoomId = 'gameId';
        testGameCardId = 'game-card-id';
        lobby = {
            roomId: testRoomId,
            gameId: testGameCardId,
            host: { id: 'testId', name: 'testName', score: 0, playerType: PlayerType.Host },
            guest: { id: 'testId2', name: 'testName2', score: 0, playerType: PlayerType.Guest },
        };
        playerRequest = {
            gameId: testGameCardId,
            playerName: 'playerName',
        };
        testConstants = {
            totalTime: 100,
            timeWon: 10,
            penalty: 10,
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameManagerService, { provide: ListGameService, useValue: listGameServiceStub }],
        }).compile();

        service = module.get<GameManagerService>(GameManagerService);
    });

    afterEach(() => {
        jest.clearAllMocks();
        service['games'] = undefined;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('createGameSolo add game from file in map', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyReadDifference = jest.spyOn<any, any>(service, 'readDifferenceFile').mockImplementation(() => {
            return {} as Difference[];
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyReadConstant = jest.spyOn<any, any>(service, 'readConstantsFile').mockImplementation(() => {
            return testConstants;
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyGetGameName = jest.spyOn<any, any>(service, 'getGameName').mockImplementation(() => {
            return 'testGameName';
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyStartTimer = jest.spyOn<any, any>(service, 'startTimer').mockImplementation(() => {
            return;
        });
        service.createSoloGame(playerRequest, testGameCardId);
        const gameInit = {
            differences: {} as Difference[],
            constants: testConstants,
            name: 'testGameName',
        };
        const newSoloGame = new SoloGame(gameInit, playerRequest);
        expect(spyStartTimer).toHaveBeenCalled();
        expect(spyReadDifference).toHaveBeenCalled();
        expect(spyReadConstant).toHaveBeenCalled();
        expect(spyGetGameName).toHaveBeenCalled();
        expect(service['gameMap'].get(testGameCardId)).toEqual(newSoloGame);
    });

    it('createGameMultiplayer add game from file in map', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyReadDifference = jest.spyOn<any, any>(service, 'readDifferenceFile').mockImplementation(() => {
            return {} as Difference[];
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyReadConstant = jest.spyOn<any, any>(service, 'readConstantsFile').mockImplementation(() => {
            return testConstants;
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyGetGameName = jest.spyOn<any, any>(service, 'getGameName').mockImplementation(() => {
            return 'testGameName';
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyStartTimer = jest.spyOn<any, any>(service, 'startTimer').mockImplementation(() => {
            return;
        });
        service.createMultiplayerGame(lobby, testGameCardId);
        const gameInit = {
            differences: {} as Difference[],
            constants: testConstants,
            name: 'testGameName',
        };
        const newMultiplayerGame = new MultiplayerGame(gameInit, lobby);
        expect(spyStartTimer).toHaveBeenCalled();
        expect(spyReadDifference).toHaveBeenCalled();
        expect(spyReadConstant).toHaveBeenCalled();
        expect(spyGetGameName).toHaveBeenCalled();
        expect(service['gameMap'].get(lobby.roomId)).toEqual(newMultiplayerGame);
    });

    it('readDifferenceFile to read differences from file', () => {
        const spy = jest.spyOn(fs, 'readFileSync');
        expect(service['readDifferenceFile'](testGameCardId)).toStrictEqual(testDifferences);
        expect(spy).toBeCalledWith(RELATIVE_PATH_TO_DIFFERENCES + testGameCardId + JSON_EXT, ENCODING);
    });

    it('readConstantsFile to read constant from file', () => {
        const spy = jest.spyOn(fs, 'readFileSync').mockReturnValueOnce(JSON.stringify(testConstants));
        expect(service['readConstantsFile']()).toStrictEqual(testConstants);
        expect(spy).toBeCalledWith('./assets/gameConstant.json', 'utf-8');
    });

    it('readGameFile to read constant from file', () => {
        const testGame: GameDataDto[] = [
            {
                id: 'testId',
                name: 'testName',
                originalSource: 'testDescription',
                modifiedSource: 'testImage',
                numberOfDifference: 1,
                isWaiting: true,
            },
        ];
        const spy = jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([testGame]));
        service['readGameFile']();
        expect(spy).toBeCalledWith(JSON_PATH, 'utf-8');
    });

    it('getGameName should get the right name', () => {
        const testGame: GameDataDto[] = [
            {
                id: 'testId',
                name: 'testName',
                originalSource: 'testDescription',
                modifiedSource: 'testImage',
                numberOfDifference: 1,
                isWaiting: true,
            },
        ];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn<any, any>(service, 'readGameFile').mockReturnValue(testGame);
        expect(service['getGameName'](testGame[0].id)).toEqual(testGame[0].name);
    });
    it('createSprintGame add game from file in map', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyReadDifference = jest.spyOn<any, any>(service, 'readDifferenceFile').mockImplementation(() => {
            return {} as Difference[];
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyReadConstant = jest.spyOn<any, any>(service, 'readConstantsFile').mockImplementation(() => {
            return testConstants;
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyStartCountdown = jest.spyOn<any, any>(service, 'startCountdown').mockImplementation(() => {
            return;
        });
        service.createSprintGame(lobby.roomId, lobby);
        const gameInit = {
            differences: {} as Difference[],
            constants: testConstants,
        };
        const newSprintGame = new SprintGame(gameInit, lobby, lobby.roomId);
        expect(spyStartCountdown).toHaveBeenCalled();
        expect(spyReadDifference).toHaveBeenCalled();
        expect(spyReadConstant).toHaveBeenCalled();
        expect(service['gameMap'].get(lobby.roomId)).toEqual(newSprintGame);
    });

    it('deleteGame should delete solo game from map', () => {
        service['gameMap'].set(
            testRoomId,
            new SoloGame(
                {
                    differences: testDifferences,
                    constants: testConstants,
                    name: 'testGameName',
                },
                playerRequest,
            ),
        );
        expect(service['gameMap'].get(testRoomId)).toBeDefined();
        service.deleteGame(testRoomId);
        expect(service['gameMap'].get(testRoomId)).toBeUndefined();
    });

    it('deleteGame should delete multiplayer game from map', () => {
        service['gameMap'].set(testRoomId, generateMultiplayerGame(testGameCardId, lobby));
        expect(service['gameMap'].get(testRoomId)).toBeDefined();
        service.deleteGame(testRoomId);
        expect(service['gameMap'].get(testRoomId)).toBeUndefined();
    });

    it('getDifferenceCount should return nbDifferences from map nbFoundDifference', () => {
        service['gameMap'].set(testRoomId, generateSoloGame(testGameCardId, playerRequest));
        expect(service.getDifferenceCount(testRoomId).total).toBe(service['gameMap'].get(testRoomId).numberOfFoundDifferences);
    });

    it('getDifferenceCount should return nbDifferences from map nbFoundDifference', () => {
        service['gameMap'].set(testRoomId, generateMultiplayerGame(testGameCardId, lobby));
        expect(service.getDifferenceCount(testRoomId).host).toBe(service['gameMap'].get(testRoomId).numberOfFoundDifferences);
    });

    it('getDifferenceCount should return nbDifferences from map nbFoundDifference', () => {
        service['gameMap'].set(testRoomId, generateMultiplayerGame(testGameCardId, lobby));
        expect(service.getDifferenceCount(testRoomId).guest).toBe(service['gameMap'].get(testRoomId).numberOfFoundDifferences);
    });

    it('getIsFinished should call is finished', () => {
        service['gameMap'].set(testRoomId, generateMultiplayerGame(testGameCardId, lobby));
        const spy = jest.spyOn(service['gameMap'].get(testRoomId), 'isFinished');
        service.getIsFinished(testRoomId);
        expect(spy).toBeCalled();
    });

    it('getWinnerId should return undefined if there is no winner', () => {
        service['gameMap'].set(testRoomId, generateMultiplayerGame(testGameCardId, lobby));
        expect(service.getWinnerId(testRoomId)).toBe(undefined);
    });

    it('getLoserId should return undefined if there is no loser', () => {
        service['gameMap'].set(testRoomId, generateMultiplayerGame(testGameCardId, lobby));
        expect(service.getLoserId(testRoomId)).toBe(undefined);
    });

    it('getGameType should call typeOfGame', () => {
        service['gameMap'].set(testRoomId, generateMultiplayerGame(testGameCardId, lobby));
        const spy = jest.spyOn(service['gameMap'].get(testRoomId), 'typeOfGame');
        service.getGameType(testRoomId);
        expect(spy).toBeCalled();
    });

    it('getGameType should call typeOfGame', () => {
        service['gameMap'].set(testRoomId, generateMultiplayerGame(testGameCardId, lobby));
        const spy = jest.spyOn(service['gameMap'].get(testRoomId), 'typeOfGame');
        service.getGameType(testRoomId);
        expect(spy).toBeCalled();
    });

    it('getGameType should return undefined if there is no game', () => {
        expect(service.getGameType(testRoomId)).toBeUndefined();
    });

    it('getRoomId should return roomId', () => {
        service['socketRooms'].set(lobby.host.id, lobby.roomId);
        expect(service.getRoomId(testRoomId)).toBe(service['socketRooms'].get(testRoomId));
    });

    it('getGameMulti should return MultiplayerGame or SprintGame', () => {
        service['gameMap'].set(testRoomId, generateMultiplayerGame(testGameCardId, lobby));
        expect(service.getMultiplayerGame(testRoomId)).toBe(service['gameMap'].get(testRoomId) as MultiplayerGame);
        service['gameMap'].set(testRoomId, generateSprintGame(testGameCardId, lobby));
        expect(service.getMultiplayerGame(testRoomId)).toBe(service['gameMap'].get(testRoomId) as SprintGame);
    });

    it('validateDifference should return validate from GameDifferences', () => {
        service['gameMap'].set(testRoomId, generateSoloGame(testGameCardId, playerRequest));
        const spy = jest.spyOn(service['gameMap'].get(testRoomId), 'validate');
        const clickedCoordinates = { x: 0, y: 0 };
        service.validateDifference(testRoomId, clickedCoordinates, 'testId');
        expect(spy).toBeCalledWith(clickedCoordinates, 'testId');
    });

    it('getPlayerName should return the player name for multiplayer game', () => {
        const objectMulti = new MultiplayerGame(
            {
                differences: testDifferences,
                constants: testConstants,
                name: 'testGameName',
            },
            lobby,
        );
        service['gameMap'].set(
            testRoomId,
            new MultiplayerGame(
                {
                    differences: testDifferences,
                    constants: testConstants,
                    name: 'testGameName',
                },
                lobby,
            ),
        );
        jest.spyOn(service['gameMap'], 'get').mockReturnValue(objectMulti as Game);

        expect(service.getPlayerName(testRoomId)).toBe('testName2');
    });

    it('getPlayerName should return the player name for solo game', () => {
        const objectMulti = new SoloGame(
            {
                differences: testDifferences,
                constants: testConstants,
                name: 'testGameName',
            },
            playerRequest,
        );
        service['gameMap'].set(
            testRoomId,
            new MultiplayerGame(
                {
                    differences: testDifferences,
                    constants: testConstants,
                    name: 'testGameName',
                },
                lobby,
            ),
        );
        jest.spyOn(service['gameMap'], 'get').mockReturnValue(objectMulti as Game);

        expect(service.getPlayerName(testRoomId)).toBe(undefined);
    });

    it('getAllDifferences should get all the differences from a game', () => {
        service['gameMap'].set(testRoomId, generateMultiplayerGame(testGameCardId, lobby));
        expect(service.getAllDifferences(testRoomId)).toEqual(testDifferences);
    });

    it('getMultiplayerGame should return undefined if typeOfgame is Solo', () => {
        service['gameMap'].set(testRoomId, generateSoloGame(testGameCardId, playerRequest));
        expect(service.getMultiplayerGame(testRoomId)).toBeUndefined();
    });

    it('removePlayer should remove the player from the game for multiplayer sprintGame', () => {
        service['gameMap'].set(lobby.roomId, generateSprintGame(testGameCardId, lobby));
        service['socketRooms'].set(lobby.host.id, lobby.roomId);
        service.removePlayer(lobby.roomId, lobby.guest.id);
        const testSprintGame = service['gameMap'].get(lobby.roomId) as SprintGame;
        expect(testSprintGame['guest']).toBeUndefined();
    });

    it('removePlayer should remove the player from the game for solo sprintGame', () => {
        const soloLobby: Lobby = {
            host: {
                id: 'testId',
                name: 'testName',
                score: 0,
                playerType: PlayerType.Host,
            },
            guest: undefined,
            roomId: 'testRoomId',
            gameId: 'testGameId',
        };
        service['gameMap'].set(
            soloLobby.roomId,
            new SprintGame(
                {
                    differences: testDifferences,
                    constants: testConstants,
                    name: 'testGameName',
                },
                soloLobby,
                soloLobby.gameId,
            ),
        );
        service['socketRooms'].set(soloLobby.host.id, lobby.roomId);
        service.removePlayer(soloLobby.roomId, soloLobby.host.id);
        expect(service['gameMap'].get(lobby.roomId)).toBeUndefined();
    });

    it('getGameConstants should return the game constants', () => {
        service['gameMap'].set(testRoomId, generateSoloGame(testGameCardId, playerRequest));
        expect(service.getGameConstants(testRoomId)).toEqual(testConstants);
    });

    it('getGameMode should return the game mode', () => {
        service['gameMap'].set(testRoomId, generateSoloGame(testGameCardId, playerRequest));
        expect(service.getGameMode(testRoomId)).toBe(GameMode.Classic);
    });
    it('getEndGameResult should return the end game result and stop the timer', () => {
        service['gameMap'].set(lobby.roomId, generateMultiplayerGame(testGameCardId, lobby));
        const spyStopTimer = jest.spyOn(service, 'stopTimer').mockImplementation();
        const spy = jest.spyOn(service['gameMap'].get(testRoomId), 'getEndGameResult').mockImplementation();
        service.getEndGameResult(testRoomId);
        expect(spyStopTimer).toBeCalled();
        expect(spy).toBeCalled();
    });

    it('getTimerInitialValue should return the timer initial value', () => {
        service['gameMap'].set(lobby.roomId, generateSprintGame(testGameCardId, lobby));
        const time = service.getTimerInitialValue(testRoomId);
        expect(time).toEqual(testConstants.totalTime);
    });

    it('startCountdown should start the countdown', () => {
        service['gameMap'].set(lobby.roomId, generateSprintGame(testGameCardId, lobby));
        const spy = jest.spyOn(service['gameMap'].get(testRoomId).timer, 'startCountdown').mockImplementation();
        service.startCountdown(testRoomId);
        expect(spy).toBeCalled();
    });

    it('startTimer should start the timer', () => {
        service['gameMap'].set(lobby.roomId, generateSoloGame(testGameCardId, playerRequest));
        const spy = jest.spyOn(service['gameMap'].get(testRoomId).timer, 'start').mockImplementation();
        service['startTimer'](testRoomId);
        expect(spy).toBeCalled();
    });

    it('getTimerObservable should return the timer value', () => {
        service['gameMap'].set(lobby.roomId, generateSoloGame(testRoomId, playerRequest));
        const testValue = service.getTimerObservable(testRoomId);
        expect(testValue).toEqual(service['gameMap'].get(testRoomId).timer.timerObservable);
    });

    // eslint-disable-next-line max-len
    it('validateSprintDifference should call the validate function of the game and return the difference if difference is in difference list', () => {
        service['gameMap'].set(
            lobby.roomId,
            new SprintGame(
                {
                    differences: testDifferences,
                    constants: testConstants,
                    name: 'testGameName',
                },
                lobby,
                lobby.gameId,
            ),
        );
        const spy = jest.spyOn(service['gameMap'].get(testRoomId), 'validate');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn<any, any>(service['gameMap'].get(testRoomId), 'chooseNextGame').mockReturnValue('test');
        const clickedCoordinates = { x: 12, y: 2 };
        const result = service.validateSprintDifference(testRoomId, clickedCoordinates);
        expect(spy).toBeCalledWith(clickedCoordinates);
        expect(result).toEqual({ difference: testDifferences[0], gameId: 'test' });
    });

    it('validateSprintDifference should call the validate function of the game and return undefined if difference is not in difference list', () => {
        service['gameMap'].set(lobby.roomId, generateSprintGame(testGameCardId, lobby));
        const spy = jest.spyOn(service['gameMap'].get(testRoomId), 'validate');
        const clickedCoordinates = { x: 0, y: 0 };
        const result = service.validateSprintDifference(testRoomId, clickedCoordinates);
        expect(spy).toBeCalledWith(clickedCoordinates);
        expect(result).toBeUndefined();
    });

    it('validateSprintDifference should return a difference with a gameId undefined if there is no next game', () => {
        service['gameMap'].set(
            lobby.roomId,
            new SprintGame(
                {
                    differences: testDifferences,
                    constants: testConstants,
                    name: 'testGameName',
                },
                lobby,
                lobby.gameId,
            ),
        );
        const spy = jest.spyOn(service['gameMap'].get(testRoomId), 'validate');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn<any, any>(service['gameMap'].get(testRoomId), 'chooseNextGame').mockReturnValue(undefined);

        const clickedCoordinates = { x: 12, y: 2 };
        const result = service.validateSprintDifference(testRoomId, clickedCoordinates);
        expect(spy).toBeCalledWith(clickedCoordinates);
        expect(result).toEqual({ difference: testDifferences[0], gameId: undefined });
    });

    it('getHint should return the good hint for spint games', () => {
        service['gameMap'].set(
            lobby.roomId,
            new SprintGame(
                {
                    differences: testDifferences,
                    constants: testConstants,
                    name: 'testGameName',
                },
                lobby,
                lobby.gameId,
            ),
        );

        const result = service.getHint(testRoomId);
        expect(result).toEqual(testDifferences[0].pixelsPosition[0]);
    });

    it('getHint should return the good hint for solo games', () => {
        service['gameMap'].set(
            lobby.roomId,
            new SoloGame(
                {
                    differences: testDifferences,
                    constants: testConstants,
                    name: 'testGameName',
                },
                playerRequest,
            ),
        );
        const result = service.getHint(testRoomId);
        expect(result).toEqual(testDifferences[0].pixelsPosition[0]);
    });
});

const generateSprintGame = (gameId: string, lobby: Lobby): SprintGame => {
    return new SprintGame(
        {
            differences: testDifferences,
            constants: {
                totalTime: 100,
                timeWon: 10,
                penalty: 10,
            },
            name: 'testGameName',
        },
        lobby,
        gameId,
    );
};

const generateSoloGame = (gameId: string, playerRequest: PlayerRequest): SoloGame => {
    return new SoloGame(
        {
            differences: testDifferences,
            constants: {
                totalTime: 100,
                timeWon: 10,
                penalty: 10,
            },
            name: 'testGameName',
        },
        playerRequest,
    );
};

const generateMultiplayerGame = (gameId: string, lobby: Lobby): MultiplayerGame => {
    return new MultiplayerGame(
        {
            differences: testDifferences,
            constants: {
                totalTime: 100,
                timeWon: 10,
                penalty: 10,
            },
            name: 'testGameName',
        },
        lobby,
    );
};
