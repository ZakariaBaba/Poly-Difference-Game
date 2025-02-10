import { CLASSIC_TIMER_INITIAL_VALUE } from '@app/constants/constant-server';
import { Lobby } from '@app/interfaces/lobby';
import { Player } from '@app/interfaces/player';
import { PlayerType } from '@app/interfaces/player-type';
import { GameType } from '@common/constants';
import { Coordinates } from '@common/interfaces/coordinates';
import { Difference } from '@common/interfaces/difference';
import { PlayerRequest } from '@common/interfaces/player-request';
import { ConstantParameter } from '@common/interfaces/public-game';
import { Game } from './game';
import { MultiplayerGame } from './multiplayer-game';
import { SoloGame } from './solo-game';
import { SprintGame } from './sprint-game';

describe('Game', () => {
    let object: Game;
    let objectMulti: MultiplayerGame;
    let objectSprint: SprintGame;
    let expectedDifferences: Difference[];
    let playerHost: Player;
    let playerGuest: Player;
    let soloPlayerRequest: PlayerRequest;
    let lobby: Lobby;
    let testConstants: ConstantParameter;

    beforeEach(async () => {
        playerHost = {
            id: '2',
            score: 0,
            name: 'string',
            playerType: PlayerType.Host,
        };
        playerGuest = {
            id: '3',
            score: 0,
            name: 'string',
            playerType: PlayerType.Guest,
        };
        lobby = {
            roomId: '1',
            host: playerHost,
            gameId: 'randomGameID',
            guest: playerGuest,
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
        testConstants = {
            totalTime: 100,
            timeWon: 10,
            penalty: 10,
        };
        soloPlayerRequest = {
            gameId: 'randomGameID',
            playerName: 'randomPlayerName',
        };
        object = new SoloGame(
            {
                differences: expectedDifferences,
                constants: testConstants,
            },
            soloPlayerRequest,
        );
        objectMulti = new MultiplayerGame(
            {
                differences: expectedDifferences,
                constants: testConstants,
            },
            lobby,
        );
        objectSprint = new SprintGame(
            {
                differences: expectedDifferences,
                constants: testConstants,
            },
            lobby,
            'randomGameID',
        );
    });

    it('should be defined', () => {
        expect(object).toBeDefined();
    });

    it('constructor() should set totalDifferences and differences to right values', () => {
        expect(object.totalDifferences).toEqual(expectedDifferences.length);
        expect(object['differences']).toEqual(expectedDifferences);
    });

    it('constructor() should do a deep copy of differences', () => {
        object['differences'].pop();
        expect(object['differences'].length).not.toEqual(expectedDifferences.length);
    });

    it('nbFoundDifference should equal to number of differences found', () => {
        const correctCoordinates: Coordinates[] = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        expect(object.numberOfFoundDifferences).toEqual(0);
        object.validate(correctCoordinates.pop(), PlayerType.Host);
        expect(object.numberOfFoundDifferences).toEqual(1);
        object.validate(correctCoordinates.pop(), PlayerType.Host);
        expect(object.numberOfFoundDifferences).toEqual(2);
    });

    it('Multigame and sprint game should return id of host and guest', () => {
        objectMulti['guest'] = { id: '1', score: 0, name: 'string', playerType: PlayerType.Guest };
        objectMulti['host'] = { id: '2', score: 0, name: 'string', playerType: PlayerType.Host };
        expect(objectMulti['guest'].id).toEqual(objectMulti.guestSocketId);
        expect(objectMulti['host'].id).toEqual(objectMulti.hostSocketId);

        objectSprint['guest'] = { id: '1', score: 0, name: 'string', playerType: PlayerType.Guest };
        objectSprint['host'] = { id: '2', score: 0, name: 'string', playerType: PlayerType.Host };
        expect(objectSprint['guest'].id).toEqual(objectSprint.guestSocketId);
        expect(objectSprint['host'].id).toEqual(objectSprint.hostSocketId);
    });

    it('Multigame and solo should return timerInitialValue', () => {
        expect(objectMulti.timerInitialValue).toEqual(CLASSIC_TIMER_INITIAL_VALUE);
        expect(object.timerInitialValue).toEqual(CLASSIC_TIMER_INITIAL_VALUE);
    });

    it('Multigame  should return score', () => {
        objectMulti['host'] = { id: '1', score: 0, name: 'string', playerType: PlayerType.Host };
        objectMulti['guest'] = { id: '1', score: 0, name: 'string', playerType: PlayerType.Guest };

        expect(objectMulti['host'].score).toEqual(objectMulti.hostScore);
        expect(objectMulti['guest'].score).toEqual(objectMulti.guestScore);
    });

    it('validate() should return found Difference if found or undefined if not found', () => {
        const correctCoordinates: Coordinates = { x: 10, y: 9 };
        const errorCoordinates: Coordinates = { x: 1, y: 0 };
        const foundDifference: Difference = { pixelsPosition: [{ x: 10, y: 9 }] };
        object['differences'].push(foundDifference);
        expect(object.validate(errorCoordinates, PlayerType.Host)).toBeFalsy();
        expect(object.validate(correctCoordinates, PlayerType.Host)).toEqual(foundDifference);
        expect(object['differences']).not.toContain(foundDifference);
    });

    it('isFinished() should return true if the differences length is 0', () => {
        expectedDifferences = [];
        expect(object.isFinished).toBeTruthy();
    });

    it('isFinished() should return true if the differences length is 0 and differences is even', () => {
        objectMulti['totalDifferences'] = 3;
        objectMulti['host'] = { id: '1', score: 0, name: 'string', playerType: PlayerType.Host };
        objectMulti['guest'] = { id: '2', score: 3, name: 'string', playerType: PlayerType.Guest };

        expect(objectMulti.isFinished()).toBeTruthy();
    });

    it('winner should get the winner of the game', () => {
        objectMulti['host'] = { id: '1', score: 0, name: 'string', playerType: PlayerType.Host };
        objectMulti['guest'] = { id: '2', score: 3, name: 'string', playerType: PlayerType.Guest };
        jest.spyOn(objectMulti, 'isFinished').mockReturnValue(true);
        expect(objectMulti.winner).toEqual(objectMulti['guest']);

        objectMulti['host'] = { id: '1', score: 3, name: 'string', playerType: PlayerType.Host };
        objectMulti['guest'] = { id: '2', score: 0, name: 'string', playerType: PlayerType.Guest };
        jest.spyOn(objectMulti, 'isFinished').mockReturnValue(true);
        expect(objectMulti.winner).toEqual(objectMulti['host']);
    });

    it('loser should get the loser of the game', () => {
        objectMulti['host'] = { id: '1', score: 0, name: 'string', playerType: PlayerType.Host };
        objectMulti['guest'] = { id: '2', score: 3, name: 'string', playerType: PlayerType.Guest };
        jest.spyOn(objectMulti, 'isFinished').mockReturnValue(true);
        expect(objectMulti.loser).toEqual(objectMulti['host']);

        objectMulti['host'] = { id: '1', score: 3, name: 'string', playerType: PlayerType.Host };
        objectMulti['guest'] = { id: '2', score: 0, name: 'string', playerType: PlayerType.Guest };
        jest.spyOn(objectMulti, 'isFinished').mockReturnValue(true);
        expect(objectMulti.loser).toEqual(objectMulti['guest']);
    });

    it('getEndGameResult should return the result of a game', () => {
        objectMulti['host'] = { id: '1', score: 0, name: 'zak', playerType: PlayerType.Host };
        objectMulti['guest'] = { id: '2', score: 3, name: 'string', playerType: PlayerType.Guest };
        objectMulti['gameId'] = '1';
        objectMulti['gameName'] = 'string';
        expect(objectMulti.getEndGameResult()).toEqual({
            gameType: GameType.Multiplayer,
            gameId: '1',
            gameName: 'string',
            score: { timeInSeconds: 0, playerName: 'string' },
        });

        object['gameId'] = '1';
        object['gameName'] = 'string';
        expect(object.getEndGameResult()).toEqual({
            gameType: GameType.Solo,
            gameId: '1',
            gameName: 'string',
            score: { timeInSeconds: 0, playerName: 'randomPlayerName' },
        });

        expect(objectSprint.getEndGameResult()).toEqual({});
    });

    it('typeOfGame() should return GameType.Solo', () => {
        expect(object.typeOfGame()).toBe(GameType.Solo);
    });

    it('differencesCount() should return GameType.Solo', () => {
        const correctCoordinates: Coordinates[] = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        expect(objectMulti.numberOfFoundDifferences).toEqual(0);
        objectMulti.validate(correctCoordinates.pop(), PlayerType.Host);
        expect(objectMulti.numberOfFoundDifferences).toEqual(1);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(objectMulti.differencesCount).toEqual({
            total: objectMulti.numberOfFoundDifferences,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            host: playerHost.score!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            guest: playerGuest.score!,
        });
        objectMulti.validate(correctCoordinates.pop(), PlayerType.Host);
        expect(objectMulti.numberOfFoundDifferences).toEqual(2);
    });

    it('isFinished() should return false if the differences length is not 0', () => {
        const correctCoordinates: Coordinates[] = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        objectMulti.validate(correctCoordinates.pop(), PlayerType.Host);
        expect(objectMulti.isFinished).toBeTruthy();
    });

    it('isFinished() should return false if the differences length is not 0 and differences is even', () => {
        object['differences'] = [];
        expect(object.isFinished()).toBeTruthy();
    });

    it('isFinished() should return true if timer is zero for sprintGame', () => {
        objectSprint['timer']['timer'] = 0;
        expect(objectSprint.isFinished()).toBeTruthy();
    });

    it('validate()', () => {
        const correctCoordinates: Coordinates[] = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
            { x: 4, y: 4 },
            { x: 5, y: 5 },
        ];
        objectMulti.validate(correctCoordinates.pop(), PlayerType.Host);
        expect(objectMulti.isFinished).toBeTruthy();
    });

    it('validate() should increase host score', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn<any, any>(objectMulti, 'isInDifference').mockResolvedValue(true);
        objectMulti.validate(expectedDifferences.pop().pixelsPosition.pop(), playerHost.id);
        expect(objectMulti.hostScore).toEqual(1);
    });

    it('guestScore() should return the score of the guest', () => {
        expect(objectMulti.differencesCount.guest).toBe(0);
    });

    it('differencesCount should return the nbFoundDifferences', () => {
        objectSprint['nbFoundDifferences'] = 5;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(objectSprint.differencesCount).toEqual({ total: 5 });
    });

    it('removePlayer should remove the the guest', () => {
        objectSprint['host'] = { id: '1', score: 0, name: 'string', playerType: PlayerType.Host };
        objectSprint['guest'] = { id: '2', score: 3, name: 'string', playerType: PlayerType.Guest };
        objectSprint.removePlayer('1');
        expect(objectSprint.hostSocketId).toEqual('2');
        expect(objectSprint['guest']).toEqual(undefined);
    });

    it('chooseNextGame should chose a randomGame', () => {
        const gamesId: Set<string> = new Set<string>(['1']);
        const randomGame = objectSprint.chooseNextGame(gamesId);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(randomGame).toEqual('1');
    });

    it('getPlayerName should get the good plauer name', () => {
        objectSprint['host'] = { id: '1', score: 0, name: 'test', playerType: PlayerType.Host };
        objectSprint['guest'] = { id: '2', score: 3, name: 'string', playerType: PlayerType.Guest };
        objectSprint.getPlayerName('1');
        expect(objectSprint.getPlayerName('1')).toEqual(objectSprint['host'].name);
        expect(objectSprint.getPlayerName('2')).toEqual(objectSprint['guest'].name);
    });
});
