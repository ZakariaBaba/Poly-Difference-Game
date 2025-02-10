import { GameDataDto } from '@app/model/dto/game-data.dto';
import { GameCreationService } from '@app/services/game-creation/game-creation.service';
import { ListGameService } from '@app/services/list-game/list-game.service';
import { ConstantParameter } from '@common/interfaces/public-game';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { GameController } from './game.controller';
describe('GameController', () => {
    let controller: GameController;
    let listGameServiceSinon: SinonStubbedInstance<ListGameService>;
    let gameCreationService: SinonStubbedInstance<GameCreationService>;
    let fakeGame: GameDataDto[];
    let fakeSingleGame: GameDataDto;
    beforeEach(async () => {
        gameCreationService = createStubInstance(GameCreationService);
        listGameServiceSinon = createStubInstance(ListGameService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                { provide: ListGameService, useValue: listGameServiceSinon },
                { provide: GameCreationService, useValue: gameCreationService },
            ],
            controllers: [GameController],
        }).compile();
        controller = module.get<GameController>(GameController);
        fakeGame = [
            {
                id: '1',
                name: 'fakeGame',
                originalSource: '',
                modifiedSource: '',
                numberOfDifference: 0,
            },
            {
                id: '1',
                name: 'fakeGame',
                originalSource: '',
                modifiedSource: '',
                numberOfDifference: 0,
            },
        ];
        fakeSingleGame = {
            id: '1',
            name: 'fakeGame',
            originalSource: '',
            modifiedSource: '',
            numberOfDifference: 0,
        };
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('gameByIndex should should return games', async () => {
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toBe(HttpStatus.OK);
            return res;
        };
        res.json = (games) => {
            expect(games).toBe(fakeGame);
            return res;
        };
        res.send = () => {
            return res;
        };
        await controller.gameByIndex(res);
    });

    it('gameByIndex should return bad request if there is an error', async () => {
        listGameServiceSinon.getListOfGames.rejects();
        const response = {} as unknown as Response;
        response.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return response;
        };
        response.send = () => response;
        await controller.gameByIndex(response);
    });

    it('gameById should a return a game by its id', async () => {
        listGameServiceSinon.getGameById.resolves(fakeSingleGame);
        const id = '1';
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = (game) => {
            expect(game).toBe(fakeSingleGame);
            return res;
        };
        await controller.gameById(id, res);
    });

    it('gameById should return 404 if the game is not found', async () => {
        listGameServiceSinon.getGameById.rejects();
        const id = '0';
        const response = {} as unknown as Response;
        response.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return response;
        };
        response.send = () => {
            return response;
        };
        await controller.gameById(id, response);
    });

    it('constantGame should send  status code ok', async () => {
        gameCreationService.saveConstant.resolves();

        const game: ConstantParameter = {
            totalTime: 30,
            timeWon: 5,
            penalty: 5,
        };
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };

        res.send = () => res;
        await controller.constantGame(game, res);
    });

    it('constantGame should send  status code bad gateway', async () => {
        gameCreationService.saveConstant.resolves();

        const game: ConstantParameter = {
            totalTime: 30,
            timeWon: 5,
            penalty: 5,
        };
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };

        res.send = () => res;
        await controller.constantGame(game, res);
    });

    it('save should send  status code ok', async () => {
        gameCreationService.gameCreationRoutine.resolves();

        const game: GameDataDto = {
            id: '2',
            name: 'string',
        };
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };

        res.send = () => res;
        await controller.save(game, res);
    });
    it('save should send  status code BAD_GATEWAY if fail', async () => {
        gameCreationService.gameCreationRoutine.resolves();

        const game: GameDataDto = {
            id: '2',
            name: 'string',
        };
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_GATEWAY);
            return res;
        };

        res.send = () => res;
        await controller.save(game, res);
    });
    it('delete should send status code NOT_FOUND', async () => {
        gameCreationService.gameCreationRoutine.resolves();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };

        res.send = () => res;
        controller.delete('rara', res);
    });
    it('deleteAll should send status code NOT_FOUND', async () => {
        gameCreationService.gameCreationRoutine.resolves();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };

        res.send = () => res;
        controller.deleteAll(res);
    });

    it('delete should send status code NO_CONTENT', async () => {
        gameCreationService.gameCreationRoutine.resolves();
        const res = {} as unknown as Response;
        res.sendStatus = (code) => {
            expect(code).toEqual(HttpStatus.NO_CONTENT);
            return res;
        };

        res.send = () => res;
        await controller.delete('ef1b17ee-1c0f-4443-9700-ab9f5d501153', res);
    });
});
