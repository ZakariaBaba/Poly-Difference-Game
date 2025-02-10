import { BMP_IMAGE, CONTENT_TYPE, FILE_NOT_FOUND, IMAGE_PATH, MODIFIED_EXT, ORIGINAL_EXT } from '@app/constants/constant-server';
import { GameCreationService } from '@app/services/game-creation/game-creation.service';
import { ListGameService } from '@app/services/list-game/list-game.service';
import { Controller, Get, Header, HttpException, HttpStatus, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { join } from 'path';

@Controller('image')
export class ImageController {
    constructor(private listGameService: ListGameService, private gameCreationService: GameCreationService) {}

    @Get('/original-image/:id')
    async getOriginalImage(@Param('id') id: string, @Res() response: Response) {
        try {
            await this.listGameService
                .read(join(process.cwd(), IMAGE_PATH + id + ORIGINAL_EXT))
                .catch(() => {
                    throw new HttpException(FILE_NOT_FOUND, HttpStatus.NOT_FOUND);
                })
                .then(() => {
                    response.setHeader(CONTENT_TYPE, BMP_IMAGE);
                    response.status(HttpStatus.OK).sendFile(join(process.cwd(), IMAGE_PATH + id + ORIGINAL_EXT));
                });
        } catch (err) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);
        }
    }

    @Get('/modified-image/:id')
    async getModifiedImage(@Param('id') id: string, @Res() response: Response) {
        try {
            await this.listGameService
                .read(join(process.cwd(), IMAGE_PATH + id + MODIFIED_EXT))
                .catch(() => {
                    throw new HttpException(FILE_NOT_FOUND, HttpStatus.NOT_FOUND);
                })
                .then(() => {
                    response.setHeader(CONTENT_TYPE, BMP_IMAGE);
                    response.status(HttpStatus.OK).sendFile(join(process.cwd(), IMAGE_PATH + id + MODIFIED_EXT));
                });
        } catch (err) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);
        }
    }

    @Post('/')
    @UseInterceptors(FileInterceptor('image'))
    @Header(CONTENT_TYPE, BMP_IMAGE)
    async uploadFile(@UploadedFile() image, @Res() response: Response) {
        try {
            await this.gameCreationService.isFileOk(image);
            response.sendStatus(HttpStatus.OK);
        } catch (err) {
            response.status(HttpStatus.BAD_REQUEST).send(err);
        }
    }
}
