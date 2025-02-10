import { AUDIO, CONTENT_TYPE, CORRECT_SOUND_PATH, FILE_NOT_FOUND, INCORRECT_SOUND_PATH } from '@app/constants/constant-server';
import { SoundService } from '@app/services/sound/sound.service';
import { Controller, Get, HttpException, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
@Controller('sound')
export class SoundController {
    constructor(private soundService: SoundService) {}

    @Get('/correct')
    async getCorrectSound(@Res() response: Response) {
        try {
            await this.soundService
                .read(join(process.cwd(), CORRECT_SOUND_PATH))
                .catch(() => {
                    throw new HttpException(FILE_NOT_FOUND, HttpStatus.NOT_FOUND);
                })
                .then(() => {
                    response.setHeader(CONTENT_TYPE, AUDIO);
                    response.status(HttpStatus.OK).sendFile(join(process.cwd(), CORRECT_SOUND_PATH));
                });
        } catch (err) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);
        }
    }

    @Get('/incorrect')
    async getIncorrectSound(@Res() response: Response) {
        try {
            await this.soundService
                .read(join(process.cwd(), INCORRECT_SOUND_PATH))
                .catch(() => {
                    throw new HttpException(FILE_NOT_FOUND, HttpStatus.NOT_FOUND);
                })
                .then(() => {
                    response.setHeader(CONTENT_TYPE, AUDIO);
                    response.status(HttpStatus.OK).sendFile(join(process.cwd(), INCORRECT_SOUND_PATH));
                });
        } catch (err) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);
        }
    }
}
