/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSON_PATH } from '@app/constants/constant-server';
import { GameDataDto } from '@app/model/dto/game-data.dto';
import { DatabaseService } from '@app/services/database/database.service';
import { GameCardInfo } from '@common/interfaces/game-card-info';
import { Score } from '@common/interfaces/score';
import { Test, TestingModule } from '@nestjs/testing';
import fs from 'fs';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { ListGameService } from './list-game.service';

describe('ListGameService', () => {
    let service: ListGameService;
    let fakeGame: GameDataDto[];
    let fakeData: GameCardInfo;
    let fakeGamesId: Set<string>;
    let databaseService: SinonStubbedInstance<DatabaseService>;
    beforeEach(async () => {
        databaseService = createStubInstance(DatabaseService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [ListGameService, { provide: DatabaseService, useValue: databaseService }],
        }).compile();
        fakeGame = [
            {
                id: '1',
                name: '',
                originalSource: 'http://localhost:3000/api/list-game/original-image/1',
                modifiedSource: 'http://localhost:3000/api/list-game/modified-image/1',
                time1v1: {} as Score[],
                timeSolo: {} as Score[],
                numberOfDifference: 0,
            },
            {
                id: '2',
                name: 'string',
                originalSource: 'http://localhost:3000/api/list-game/original-image/2',
                modifiedSource: 'http://localhost:3000/api/list-game/modified-image/2',
                time1v1: {} as Score[],
                timeSolo: {} as Score[],
                numberOfDifference: 0,
            },
            {
                id: '3',
                name: 'string',
                originalSource: 'http://localhost:3000/api/list-game/original-image/3',
                modifiedSource: 'http://localhost:3000/api/list-game/modified-image/3',
                time1v1: {} as Score[],
                timeSolo: {} as Score[],
                numberOfDifference: 0,
            },
        ];

        fakeData = {
            listOfGames: [
                {
                    id: 'fa689a60-d4f4-4939-9dd5-a29a6c0907f3',
                    name: 'string',
                    originalSource: 'http://localhost:3000/api/list-game/original-image/fa689a60-d4f4-4939-9dd5-a29a6c0907f3',
                    modifiedSource: 'http://localhost:3000/api/list-game/modified-image/fa689a60-d4f4-4939-9dd5-a29a6c0907f3',
                    time1v1: {} as Score[],
                    timeSolo: {} as Score[],
                    numberOfDifference: 0,
                    isWaiting: false,
                },
                {
                    id: '71fd8489-b385-47a1-9f99-935bebbc1379',
                    name: 'waddawwda',
                    originalSource: 'http://localhost:3000/api/list-game/original-image/71fd8489-b385-47a1-9f99-935bebbc1379',
                    modifiedSource: 'http://localhost:3000/api/list-game/modified-image/71fd8489-b385-47a1-9f99-935bebbc1379',
                    numberOfDifference: 3,
                    isWaiting: false,
                },
            ],
            isThereMoreGames: false,
        };

        fakeGamesId = new Set<string>(['1', '2', '3']);
        service = module.get<ListGameService>(ListGameService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getListOfGames should reject', async () => {
        service['setGameData'] = jest.fn();
        service['gameData'] = [];
        await service.getListOfGames(2).catch((error) => {
            expect(error).toEqual('Index out of range');
        });
    });

    it('getListOfGames should get array of games', async () => {
        service['setGameData'] = jest.fn();
        service['gameData'] = fakeGame;
        await service.getListOfGames(0).then((data) => expect(data.listOfGames).toEqual(fakeGame));
    });

    it('getGameById should return a game based on the id', async () => {
        service['setGameData'] = jest.fn();
        service['gameData'] = fakeGame;
        await service.getGameById('2').then((data) => expect(data).toEqual(fakeGame[1]));
    });

    it('getGameById should throw when the id is not found', async () => {
        try {
            service['setGameData'] = jest.fn();
            service['gameData'] = fakeGame;
            await service.getGameById('22');
        } catch (e) {
            expect(e).toEqual(undefined);
        }
    });

    it('getGamesId should return set of gameId', () => {
        service['gamesId'] = fakeGamesId;
        expect(service.getGamesId()).toEqual(fakeGamesId);
    });

    it('read should read data file', (done) => {
        let readFileCallback;
        // @ts-ignore
        jest.spyOn(fs, 'readFile').mockImplementation((path, options, callback) => {
            readFileCallback = callback;
        });
        service.read(JSON_PATH);
        readFileCallback(null, JSON.stringify(fakeData));
        expect(fs.readFile).toBeCalledWith(JSON_PATH, 'utf-8', readFileCallback);
        done();
    });

    it('setGameData should set the gameData', async () => {
        const stringData = JSON.stringify(fakeData);
        jest.spyOn(service, 'read').mockReturnValue(Promise.resolve(stringData));
        await service['setGameData']();
        expect(service['gameData']).toEqual(fakeData['listOfGames']);
    });

    it('delete should resolves', async () => {
        jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(fakeGame));
        jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
            return;
        });

        service['gameData'] = fakeGame;
        jest.spyOn(databaseService, 'deleteByGameId');
        await service.deleteGameById('1', './assets_tests/fake_list_games.json');
        expect(databaseService.deleteByGameId).toBeCalledWith('1');
    });

    it('deleteAll game should deleteAll in the db and clear the set of id', async () => {
        jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
            return;
        });
        const deleteAll = jest.spyOn(databaseService, 'deleteAll').mockResolvedValue();
        jest.spyOn<any, any>(service, 'deleteAllDifference').mockImplementation(() => {
            return;
        });
        jest.spyOn<any, any>(service, 'deleteAllImage').mockImplementation(() => {
            return;
        });
        service['gamesId'] = fakeGamesId;
        await service.deleteAllGame('path');
        expect(deleteAll).toBeCalled();
        expect(service['gamesId'].size).toEqual(0);
    });

    it('SetGameStatus should set the status', async () => {
        const pendingSet: Set<string> = new Set<string>();
        pendingSet.add('1');
        service.setGameStatus('1', true);
        expect(service['pendingGames']).toEqual(pendingSet);

        pendingSet.delete('1');
        service.setGameStatus('1', false);
        expect(service['pendingGames']).toEqual(pendingSet);
    });

    it('deleteDifference should delete the file containing the differences', async () => {
        const unlinkMock = jest.spyOn(fs, 'unlink');
        unlinkMock.mockImplementationOnce((filename, callback) => {
            callback(null);
        });
        await service['deleteDifference']('fwef');
        expect(fs.unlink).toBeCalledWith('./assets/differences/fwef.json', expect.any(Function));
    });
    it('deleteImageOriginal should delete the file containing the differences', async () => {
        const unlinkMock = jest.spyOn(fs, 'unlink');
        unlinkMock.mockImplementationOnce((filename, callback) => {
            callback(null);
        });
        await service['deleteImageOriginal']('fwef');
        expect(fs.unlink).toBeCalledWith('./assets/image/fwef_original.bmp', expect.any(Function));
    });
    it('deleteImageModified should delete the file containing the differences', async () => {
        const unlinkMock = jest.spyOn(fs, 'unlink');
        unlinkMock.mockImplementationOnce((filename, callback) => {
            callback(null);
        });
        await service['deleteImageModified']('fwef');
        expect(fs.unlink).toBeCalledWith('./assets/image/fwef_modified.bmp', expect.any(Function));
    });
});
