import { CORRECT_SOUND_PATH, INCORRECT_SOUND_PATH } from '@app/constants/constant-server';
import { SoundService } from '@app/services/sound/sound.service';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { join } from 'path';
import { createStubInstance, SinonStubbedInstance } from 'sinon';

import { SoundController } from './sound.controller';
describe('SoundController', () => {
    let controller: SoundController;
    let soundServiceSinon: SinonStubbedInstance<SoundService>;

    beforeEach(async () => {
        soundServiceSinon = createStubInstance(SoundService);

        const module: TestingModule = await Test.createTestingModule({
            controllers: [SoundController],
            providers: [{ provide: SoundService, useValue: soundServiceSinon }],
        }).compile();

        controller = module.get<SoundController>(SoundController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
    it('getCorrectSound should return an audio file', async () => {
        jest.spyOn(soundServiceSinon, 'read').mockReturnValue(Promise.resolve('fakeSound'));
        const res = {} as unknown as Response;
        res.sendFile = (path) => {
            expect(path).toEqual(join(process.cwd(), CORRECT_SOUND_PATH));
            return res;
        };
        res.setHeader = (header, value) => {
            expect(header).toEqual('content-type');
            expect(value).toEqual('audio/mpeg');
            return res;
        };
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => {
            return res;
        };
        await controller.getCorrectSound(res);
    });
    it('getCorrectSound should return 404 when audio file does not exist', async () => {
        jest.spyOn(soundServiceSinon, 'read').mockReturnValue(Promise.reject());
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.status = () => res;
        res.send = () => {
            return res;
        };
        await controller.getCorrectSound(res);
    });
    it('getIncorrectSound should return an audio file', async () => {
        jest.spyOn(soundServiceSinon, 'read').mockReturnValue(Promise.resolve('fakeSound'));
        const res = {} as unknown as Response;
        res.sendFile = (path) => {
            expect(path).toEqual(join(process.cwd(), INCORRECT_SOUND_PATH));
            return res;
        };
        res.setHeader = (header, value) => {
            expect(header).toEqual('content-type');
            expect(value).toEqual('audio/mpeg');
            return res;
        };
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => {
            return res;
        };
        await controller.getIncorrectSound(res);
    });
    it('getIncorrectSound should return 404 when audio file does not exist', async () => {
        jest.spyOn(soundServiceSinon, 'read').mockReturnValue(Promise.reject());
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.status = () => res;
        res.send = () => {
            return res;
        };
        await controller.getIncorrectSound(res);
    });
});
