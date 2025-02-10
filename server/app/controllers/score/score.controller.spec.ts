import { EndGameResult } from '@app/interfaces/end-game-result';
import { GameScore } from '@app/model/dto/schema/game-score';
import { DatabaseService } from '@app/services/database/database.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { ScoreService } from '@app/services/score/score.service';
import { GameType } from '@common/constants';
import { Score } from '@common/interfaces/score';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { ScoreController } from './score.controller';
describe('ScoreController', () => {
    let controller: ScoreController;
    let databaseServiceSinon: SinonStubbedInstance<DatabaseService>;
    let gameManagerServiceSinon: SinonStubbedInstance<GameManagerService>;
    let scoreServiceSinon: SinonStubbedInstance<ScoreService>;
    let fakeScore: Score[];
    let fakeGameScore: GameScore;

    beforeEach(async () => {
        databaseServiceSinon = createStubInstance(DatabaseService);
        gameManagerServiceSinon = createStubInstance(GameManagerService);
        scoreServiceSinon = createStubInstance(ScoreService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ScoreController],
            providers: [
                { provide: DatabaseService, useValue: databaseServiceSinon },
                { provide: ScoreService, useValue: scoreServiceSinon },
                { provide: GameManagerService, useValue: gameManagerServiceSinon },
            ],
        }).compile();

        controller = module.get<ScoreController>(ScoreController);
        fakeGameScore = {
            gameId: 'test',
            scores1v1: fakeScore,
            scoresSolo: fakeScore,
        };
        fakeScore = [
            {
                playerName: 'testName',
                timeInSeconds: 1,
                formattedTime: '1',
            },
            {
                playerName: 'testName2',
                timeInSeconds: 2,
                formattedTime: '2',
            },
        ];
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('getScoreMultiplayer should return scores', async () => {
        databaseServiceSinon.getScoresByGameId.resolves(fakeScore);
        const id = 'test';
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toBe(HttpStatus.OK);
            return res;
        };
        res.send = (games) => {
            expect(games).toBe(fakeScore);
            return res;
        };
        await controller.getScoreMultiplayer(id, res);
    });

    it('getScoreMultiplayer should return not_found', async () => {
        databaseServiceSinon.getScoresByGameId.resolves(null);
        const id = 'test';
        const res = {} as unknown as Response;
        res.sendStatus = (code) => {
            expect(code).toBe(HttpStatus.NOT_FOUND);
            return res;
        };

        await controller.getScoreMultiplayer(id, res);
    });

    it('getScoreMultiplayer should return err', async () => {
        databaseServiceSinon.getScoresByGameId.resolves([]);
        const id = 'test';
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toBe(HttpStatus.SERVICE_UNAVAILABLE);
            return res;
        };
        res.send = () => {
            return res;
        };
        await controller.getScoreMultiplayer(id, res);
    });

    it('getScoreSolo should return scores', async () => {
        databaseServiceSinon.getScoresByGameId.resolves(fakeScore);
        const id = 'test';
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toBe(HttpStatus.OK);
            return res;
        };
        res.send = (games) => {
            expect(games).toBe(fakeScore);
            return res;
        };
        await controller.getScoreSolo(id, res);
    });

    it('getScoreSolo should return not_found', async () => {
        databaseServiceSinon.getScoresByGameId.resolves(null);
        const id = 'test';
        const res = {} as unknown as Response;
        res.sendStatus = (code) => {
            expect(code).toBe(HttpStatus.NOT_FOUND);
            return res;
        };

        await controller.getScoreSolo(id, res);
    });

    it('getScoreSolo should return err', async () => {
        databaseServiceSinon.getScoresByGameId.resolves([]);
        const id = 'test';
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toBe(HttpStatus.SERVICE_UNAVAILABLE);
            return res;
        };
        res.send = () => {
            return res;
        };
        await controller.getScoreSolo(id, res);
    });

    it('getNewScore should return scores', async () => {
        const spyDelete = jest.spyOn(databaseServiceSinon, 'deleteByGameId');
        scoreServiceSinon.reset.resolves(fakeGameScore);

        const id = 'test';
        const res = {} as unknown as Response;

        res.status = (code) => {
            expect(code).toBe(HttpStatus.OK);
            return res;
        };

        res.send = (games) => {
            expect(games).toBe(fakeGameScore);
            return res;
        };

        await controller.getNewScore(id, res);
        expect(spyDelete).toHaveBeenCalled();
    });

    it('getNewScore should return 404 if the score is not found', async () => {
        const spyDelete = jest.spyOn(databaseServiceSinon, 'deleteByGameId');
        scoreServiceSinon.reset.resolves(fakeGameScore);

        const id = '1';
        const res = {} as unknown as Response;

        res.status = (code) => {
            expect(code).toBe(HttpStatus.NOT_FOUND);
            return res;
        };

        res.send = () => {
            return res;
        };

        await controller.getNewScore(id, res);
        expect(spyDelete).toHaveBeenCalled();
    });

    it('getUpdateScore should return scores', async () => {
        const gameScore: Score = {
            playerName: 'string',
            timeInSeconds: 1,
            formattedTime: '1',
        };

        const endGameResult: EndGameResult = {
            gameType: GameType.Solo,
            gameId: 'string',
            score: gameScore,
        };
        databaseServiceSinon.updateScore.resolves(endGameResult);
        const res = {} as unknown as Response;

        res.status = (code) => {
            expect(code).toBe(HttpStatus.OK);
            return res;
        };

        res.send = (game) => {
            expect(game).toEqual(endGameResult.toString());
            return res;
        };

        await controller.getUpdateScore(res, endGameResult);
    });

    it('getUpdateScore should not return scores if an error occured', async () => {
        const gameScore: Score = {
            playerName: 'string',
            timeInSeconds: 1,
            formattedTime: '1',
        };

        const endGameResult: EndGameResult = {
            gameType: GameType.Solo,
            gameId: 'string',
            score: gameScore,
        };
        databaseServiceSinon.updateScore.resolves();
        const res = {} as unknown as Response;

        res.sendStatus = (code) => {
            expect(code).toBe(HttpStatus.NOT_FOUND);
            return res;
        };

        await controller.getUpdateScore(res, endGameResult);
    });

    it('getAllNewScore should send status code OK', async () => {
        const deleteByGameId = jest.spyOn(databaseServiceSinon, 'deleteByGameId');
        scoreServiceSinon.reset.resolves(fakeGameScore);
        const res = {} as unknown as Response;

        res.status = (code) => {
            expect(code).toBe(HttpStatus.OK);
            return res;
        };

        res.send = () => {
            return res;
        };

        await controller.getAllNewScore('1', res);
        expect(deleteByGameId).toHaveBeenCalled();
    });

    it('getAllNewScore should send status code not found', async () => {
        const res = {} as unknown as Response;

        res.status = (code) => {
            expect(code).toBe(HttpStatus.NOT_FOUND);
            return res;
        };

        res.send = () => {
            return res;
        };

        await controller.getAllNewScore('1', res);
    });

    it('deleteAll should send status code OK', async () => {
        databaseServiceSinon.deleteAll.resolves();
        const res = {} as unknown as Response;

        res.status = (code) => {
            expect(code).toBe(HttpStatus.OK);
            return res;
        };

        res.send = () => {
            return res;
        };

        await controller.deleteAll(res);
    });

    it('getUpdateScore should send status code INTERNAL_SERVER_ERROR', async () => {
        databaseServiceSinon.deleteAll.rejects();
        const res = {} as unknown as Response;

        res.status = (code) => {
            expect(code).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };

        res.send = () => {
            return res;
        };

        await controller.deleteAll(res);
    });
});
