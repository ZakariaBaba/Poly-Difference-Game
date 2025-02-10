import { IMAGE_PATH, MODIFIED_EXT, ORIGINAL_EXT } from '@app/constants/constant-server';
import { ImageController } from '@app/controllers/image/image.controller';
import { GameCreationService } from '@app/services/game-creation/game-creation.service';
import { ListGameService } from '@app/services/list-game/list-game.service';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { join } from 'path';
import { createStubInstance, SinonStubbedInstance } from 'sinon';

describe('ImageController', () => {
    let controller: ImageController;
    let listGameServiceSinon: SinonStubbedInstance<ListGameService>;
    let gameCreationService: SinonStubbedInstance<GameCreationService>;
    beforeEach(async () => {
        listGameServiceSinon = createStubInstance(ListGameService);
        gameCreationService = createStubInstance(GameCreationService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                { provide: ListGameService, useValue: listGameServiceSinon },
                { provide: GameCreationService, useValue: gameCreationService },
            ],
            controllers: [ImageController],
        }).compile();

        controller = module.get<ImageController>(ImageController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('getOriginalImage should return an image', async () => {
        const id = '0d75af56-91e0-416f-8519-6a3523a27d35';
        const res = {} as unknown as Response;
        listGameServiceSinon.read.resolves('fakeImage');

        res.sendFile = (path) => {
            expect(path).toEqual(join(process.cwd(), IMAGE_PATH + id + ORIGINAL_EXT));
            return res;
        };
        res.setHeader = (header, value) => {
            expect(header).toEqual('content-type');
            expect(value).toEqual('image/bmp');
            return res;
        };
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => {
            return res;
        };
        await controller.getOriginalImage(id, res);
    });

    it('getOriginalImage should return 404 when image does not exist', async () => {
        const res: Response = {} as unknown as Response;
        listGameServiceSinon.read.rejects();
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.status = () => res;
        res.send = () => {
            return res;
        };
        await controller.getOriginalImage('0', res);
    });

    it('getModifiedImage should return an image', async () => {
        const id = '0d75af56-91e0-416f-8519-6a3523a27d35';
        const res = {} as unknown as Response;
        listGameServiceSinon.read.resolves('fakeImage');
        res.sendFile = (path) => {
            expect(path).toEqual(join(process.cwd(), IMAGE_PATH + id + MODIFIED_EXT));
            return res;
        };
        res.setHeader = (header, value) => {
            expect(header).toEqual('content-type');
            expect(value).toEqual('image/bmp');
            return res;
        };
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => {
            return res;
        };
        await controller.getModifiedImage(id, res);
    });

    it('getModifiedImage should return 404 when image does not exist', async () => {
        const id = '0';
        const fakePath = join(process.cwd(), IMAGE_PATH + id + ORIGINAL_EXT);
        const res: Response = {} as unknown as Response;
        listGameServiceSinon.read.rejects();
        res.sendFile = (path) => {
            expect(path).toEqual(fakePath);
        };
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
            return res;
        };
        res.send = () => {
            return res;
        };
        await controller.getModifiedImage('0', res);
    });

    it('uploadfile should send true if is file is ok', async () => {
        const isFileOkSpy = jest.spyOn(gameCreationService, 'isFileOk');
        isFileOkSpy.mockResolvedValue();
        const file = jest.fn();
        const res = {} as unknown as Response;
        res.sendStatus = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        await controller.uploadFile(file, res);
    });
    it('uploadfile should send false if is file is not ok', async () => {
        const isFileOkSpy = jest.spyOn(gameCreationService, 'isFileOk');
        isFileOkSpy.mockRejectedValue('Wrong image size or bit depth');
        const file = jest.fn();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = (data) => {
            expect(data).toEqual('Wrong image size or bit depth');
            return res;
        };
        await controller.uploadFile(file, res);
    });
});
