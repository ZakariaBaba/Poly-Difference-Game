import { GameDifferences } from '@app/classes/game-differences';
import { Difference } from '@common/interfaces/difference';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import { DifferencesService } from './differences.service';
jest.mock('fs', () => ({
    // eslint-disable-next-line no-unused-vars
    readFileSync: jest.fn((fileName: string) => {
        return JSON.stringify(testDifferences);
    }),
}));

const testDifferences: Difference[] = [{ pixelsPosition: [{ x: 12, y: 2 }] }, { pixelsPosition: [{ x: 12, y: 2 }] }];

describe('DifferencesService', () => {
    let service: DifferencesService;
    let testGameId: string;
    let testGameCardId: string;

    beforeEach(async () => {
        testGameId = 'gameId';
        testGameCardId = 'game-card-id';
        const module: TestingModule = await Test.createTestingModule({
            providers: [DifferencesService],
        }).compile();

        service = module.get<DifferencesService>(DifferencesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('setGameDifferences add game differences from file in map', () => {
        const spy = jest.spyOn(service, 'readDifferenceFile');
        spy.mockReturnValue(testDifferences);
        service.setGameDifferences(testGameId, testGameCardId);
        expect(spy).toBeCalledWith(testGameCardId);
        expect(service['differencesMap'].get(testGameId)).toStrictEqual(new GameDifferences(testDifferences));
    });

    it('readDifferenceFile to read differences from file', () => {
        const spy = jest.spyOn(fs, 'readFileSync');
        expect(service.readDifferenceFile(testGameCardId)).toStrictEqual(testDifferences);
        expect(spy).toBeCalledWith('./assets/differences/' + testGameCardId + '.json', 'utf-8');
    });

    it('deleteGameDifferences should delete from map', () => {
        service['differencesMap'].set(testGameId, new GameDifferences(testDifferences));
        expect(service['differencesMap'].get(testGameId)).toBeDefined();
        service.deleteGameDifferences(testGameId);
        expect(service['differencesMap'].get(testGameId)).toBeUndefined();
    });

    it('getDiferenceCount should return nbDifferences from map nbFoundDifference', () => {
        service['differencesMap'].set(testGameId, new GameDifferences(testDifferences));
        expect(service.getDifferenceCount(testGameId)).toBe(service['differencesMap'].get(testGameId).nbFoundDifferences);
    });

    it('getTotalDifferences should return totalDifferences from GameDifferences', () => {
        service['differencesMap'].set(testGameId, new GameDifferences(testDifferences));
        expect(service.getTotalDifferences(testGameId)).toBe(service['differencesMap'].get(testGameId).totalDifferences);
    });

    it('validateDifference should return validate from GameDifferences', () => {
        service['differencesMap'].set(testGameId, new GameDifferences(testDifferences));
        const spy = jest.spyOn(service['differencesMap'].get(testGameId), 'validate');
        const clickedCoordinates = { x: 0, y: 0 };
        service.validateDifference(testGameId, clickedCoordinates);
        expect(spy).toBeCalledWith(clickedCoordinates);
    });
});
