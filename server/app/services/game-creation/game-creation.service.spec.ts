/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { FILE_GENERATION_ERROR, JSON_WRITING_ERROR, MODIFIED_IMAGE_PATH_SERVER, ORIGINAL_IMAGE_PATH_SERVER } from '@app/constants/constant-server';
import { ImageInfo } from '@app/interfaces/image-data';
import { GameDataDto } from '@app/model/dto/game-data.dto';
import { DatabaseService } from '@app/services/database/database.service';
import { ScoreService } from '@app/services/score/score.service';
import { Difference } from '@common/interfaces/difference';
import { ConstantParameter, PublicGame } from '@common/interfaces/public-game';
import { Score } from '@common/interfaces/score';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import { readFileSync } from 'fs';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { listOfGames } from './data.json';
import { GameCreationService } from './game-creation.service';

const image = readFileSync('./app/controllers/game-creation/image-test/148_modified.bmp');
const buffers = Buffer.from(image);
const base64 = Buffer.from(image).toString('base64');
const fakeData: GameDataDto[] = [
    {
        id: '2',
        name: 'zak',
        originalImage: base64,
        modifiedImage: base64,
        originalSource: ORIGINAL_IMAGE_PATH_SERVER + '2',
        modifiedSource: MODIFIED_IMAGE_PATH_SERVER + '2',
        time1v1: {} as Score[],
        timeSolo: {} as Score[],
        numberOfDifference: 2,
    },
    {
        id: '2',
        name: 'zak',
        originalImage: base64,
        modifiedImage: base64,
        originalSource: ORIGINAL_IMAGE_PATH_SERVER + '2',
        modifiedSource: MODIFIED_IMAGE_PATH_SERVER + '2',
        time1v1: {} as Score[],
        timeSolo: {} as Score[],
        numberOfDifference: 2,
    },
];

jest.mock('fs', () => ({
    // eslint-disable-next-line no-unused-vars
    readFileSync: jest.fn(() => {
        return JSON.stringify(listOfGames);
    }),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    writeFileSync: jest.fn(() => {}),
}));

describe('GameCreationService', () => {
    let service: GameCreationService;
    let dataBaseService: DatabaseService;
    let constant: ConstantParameter;
    let scoreManagerService: SinonStubbedInstance<ScoreService>;

    beforeEach(async () => {
        scoreManagerService = createStubInstance(ScoreService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameCreationService, { provide: ScoreService, useValue: scoreManagerService }],
        }).compile();
        service = module.get<GameCreationService>(GameCreationService);
        constant = {
            totalTime: 2,
            timeWon: 3,
            penalty: 4,
        };
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should call writefileSync', async () => {
        const spy = jest.spyOn(fs, 'writeFileSync');
        const game: ImageInfo = {
            original: base64,
            modified: base64,
        };
        service['upload'](game, '2');
        expect(spy).toHaveBeenCalled();
        spy.mockReset();
    });
    it('upload should throw an error', async () => {
        const spy = jest.spyOn(fs, 'writeFileSync');
        const game: ImageInfo = {
            original: undefined,
            modified: undefined,
        };
        try {
            await service['upload'](game, '2');
        } catch (e) {
            expect(e).toEqual(TypeError(FILE_GENERATION_ERROR));
        }
        spy.mockReset();
    });

    it('saveInJSon should throw if the data is incorrect', async () => {
        const spy = jest.spyOn(fs, 'readFileSync');
        const spyWriteFile = jest.spyOn(fs, 'writeFileSync');
        const spyStringify = jest.spyOn(JSON, 'stringify');
        const spySaveInJson = jest.spyOn<any, any>(service, 'save');
        spySaveInJson.mockImplementation(() => {
            return;
        });
        spyWriteFile.mockReturnValue();
        spy.mockReturnValue(JSON.stringify(fakeData));
        const data: PublicGame = {
            id: '2',
            name: '3',
            originalSource: ORIGINAL_IMAGE_PATH_SERVER + '2',
            modifiedSource: MODIFIED_IMAGE_PATH_SERVER + '2',
            numberOfDifference: 0,
            isWaiting: false,
        };
        service['save'](data);
        expect(spySaveInJson).toHaveBeenCalled();
        expect(spyStringify).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
        expect(spySaveInJson).toBeCalledWith(data);
        expect(spySaveInJson).not.toThrowError(JSON_WRITING_ERROR);
        spy.mockReset();
    });

    it('saveInJSon should throw if the data is incorrect', async () => {
        const spy = jest.spyOn(fs, 'readFileSync');
        spy.mockReturnValue(JSON.stringify(fakeData));
        const data: PublicGame = {
            id: '2',
            name: '3',
            originalSource: ORIGINAL_IMAGE_PATH_SERVER + '2',
            modifiedSource: MODIFIED_IMAGE_PATH_SERVER + '2',
            numberOfDifference: 0,
            isWaiting: false,
        };
        expect(() => service['save'](data)).toThrowError(JSON_WRITING_ERROR);
        spy.mockReset();
    });
    it('saveCoordinate', async () => {
        const spy = jest.spyOn(fs, 'writeFileSync');
        const listOfDifferences: Difference[] = [{ pixelsPosition: [{ x: 1, y: 0 }] }];
        service['saveCoordinate'](listOfDifferences, '1');
        expect(spy).toHaveBeenCalled();
        spy.mockReset();
    });
    it('saveCoordinate', async () => {
        const spy = jest.spyOn(fs, 'writeFileSync');
        const listOfDifferences: Difference[] = undefined;
        try {
            await service['saveCoordinate'](null, undefined);
        } catch (e) {
            expect(e).toEqual(TypeError(JSON_WRITING_ERROR));
        }
        spy.mockReset();
    });

    it('saveConstant', async () => {
        const spy = jest.spyOn(fs, 'writeFileSync');
        const listOfDifferences: Difference[] = undefined;
        try {
            await service.saveConstant(constant);
        } catch (e) {
            expect(e).toEqual(TypeError(JSON_WRITING_ERROR));
        }
        spy.mockReset();
    });

    it('saveConstant', async () => {
        const spy = jest.spyOn(fs, 'writeFileSync');
        const listOfDifferences: Difference[] = undefined;
        try {
            await service.saveConstant(undefined);
        } catch (e) {
            expect(e).toEqual(TypeError(JSON_WRITING_ERROR));
        }
        spy.mockReset();
    });

    it('gameCreationRoutine', async () => {
        const spy = jest.spyOn(fs, 'readFileSync');
        spy.mockReturnValue(JSON.stringify(listOfGames));
        const spySaveCoordinate = jest.spyOn<any, any>(service, 'saveCoordinate');
        const spyUpload = jest.spyOn<any, any>(service, 'upload');
        const spySaveInJson = jest.spyOn<any, any>(service, 'save');
        spySaveInJson.mockImplementation(() => {
            return;
        });

        service.gameCreationRoutine(fakeData[0]);
        expect(spySaveCoordinate).toHaveBeenCalled();
        expect(spyUpload).toHaveBeenCalled();
        expect(spySaveInJson).toHaveBeenCalled();
        spy.mockReset();
    });
});
