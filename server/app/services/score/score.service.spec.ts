import { EndGameResult } from '@app/interfaces/end-game-result';
import { GameScore } from '@app/model/dto/schema/game-score';
import { DatabaseService } from '@app/services/database/database.service';
import { GameType } from '@common/constants';
import { Score } from '@common/interfaces/score';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { ScoreService } from './score.service';

describe('ScoreService', () => {
    let service: ScoreService;
    let databaseServiceSinon: SinonStubbedInstance<DatabaseService>;
    let fakeScore: Score;
    let fakeEndGameResult: EndGameResult;

    beforeEach(async () => {
        fakeScore = {
            playerName: 'testName',
            timeInSeconds: 1,
            formattedTime: '1',
        };

        fakeEndGameResult = {
            gameType: GameType.Solo,
            gameId: 'test',
            score: fakeScore,
        };

        databaseServiceSinon = createStubInstance(DatabaseService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [ScoreService, { provide: DatabaseService, useValue: databaseServiceSinon }],
        }).compile();

        service = module.get<ScoreService>(ScoreService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('endGameRoutine should call convertTime and return a bool', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const privateSpy = jest.spyOn<any, any>(service, 'convertTime');
        const updateScoreSpy = jest.spyOn(databaseServiceSinon, 'updateScore');
        await service.endGameRoutine(fakeEndGameResult);
        expect(privateSpy).toBeCalled();
        expect(updateScoreSpy).toBeCalled();
    });

    it('endGameRoutine should return an error if convertTime fails', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const privateSpy = jest.spyOn<any, any>(service, 'convertTime').mockImplementation(() => {
            throw new Error('test');
        });
        const updateScoreSpy = jest.spyOn(databaseServiceSinon, 'updateScore');
        await expect(service.endGameRoutine(fakeEndGameResult)).rejects.toThrow();
        expect(privateSpy).toBeCalled();
        expect(updateScoreSpy).not.toBeCalled();
    });

    it('reset should call generateGameScores and addScore', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const deleteAllGameScoreByIdSpy = jest.spyOn<any, any>(service, 'generateGameScores');
        const addScoreSpy = jest.spyOn(databaseServiceSinon, 'addScore');
        await service.reset('test');
        expect(deleteAllGameScoreByIdSpy).toBeCalled();
        expect(addScoreSpy).toBeCalled();
    });

    it('scoreCreationRoutine should call generateGameScores and addScore', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const deleteAllGameScoreByIdSpy = jest.spyOn<any, any>(service, 'generateGameScores');
        const addScoreSpy = jest.spyOn(databaseServiceSinon, 'addScore');
        await service.scoreCreationRoutine('test');
        expect(deleteAllGameScoreByIdSpy).toBeCalled();
        expect(addScoreSpy).toBeCalled();
    });

    it('resetAll should call reset', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const generateGameScoreSpy = jest.spyOn<any, any>(service, 'generateGameScores').mockImplementation(async () => {
            return Promise.resolve({} as GameScore);
        });
        const addScoreSpy = jest.spyOn(databaseServiceSinon, 'addScore').mockImplementation(async () => {
            return Promise.resolve();
        });
        await service.resetAll('gameId');
        expect(generateGameScoreSpy).toBeCalled();
        expect(addScoreSpy).toBeCalled();
    });
});
