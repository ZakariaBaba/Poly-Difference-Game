import { CORRECT_SOUND_PATH } from '@app/constants/constant-server';
import { Test, TestingModule } from '@nestjs/testing';
import fs from 'fs';
import { SoundService } from './sound.service';

describe('SoundService', () => {
    let service: SoundService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SoundService],
        }).compile();

        service = module.get<SoundService>(SoundService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    it('read should not read data file if path is wrong', async () => {
        try {
            // @ts-ignore
            jest.spyOn(fs, 'readFile').mockImplementation((path, options, callback) => {
                callback('ERROR');
            });
            await service.read('wrongpath');
        } catch (error) {
            expect(error).toBe('ERROR');
        }
    });
    it('read should not read data file if path is wrong', async () => {
        try {
            // @ts-ignore
            jest.spyOn(fs, 'readFile').mockImplementation((path, options, callback) => {
                callback('');
            });
            await service.read(CORRECT_SOUND_PATH);
        } catch (error) {
            expect(error).toBe('ERROR');
        }
    });
});
