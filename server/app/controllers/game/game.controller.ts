import { JSON_PATH } from '@app/constants/constant-server';
import { GameDataDto } from '@app/model/dto/game-data.dto';
import { GameCreationService } from '@app/services/game-creation/game-creation.service';
import { ListGameService } from '@app/services/list-game/list-game.service';
import { ConstantParameter } from '@common/interfaces/public-game';
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Query, Res } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { Response } from 'express';
@Controller('game')
export class GameController {
    constructor(private listGameService: ListGameService, private gameCreationService: GameCreationService) {}

    @Get('/:id')
    async gameById(@Param('id') id: string, @Res() response: Response) {
        try {
            const game = await this.listGameService.getGameById(id);
            response.status(HttpStatus.OK).send(game);
        } catch (err) {
            response.status(HttpStatus.NOT_FOUND).send(err);
        }
    }

    @Get('/')
    async gameByIndex(@Res() response: Response, @Query('index') index?: number) {
        try {
            const allGames = await this.listGameService.getListOfGames(index);
            response.status(HttpStatus.OK).send(allGames);
        } catch (err) {
            response.status(HttpStatus.BAD_REQUEST).send(err);
        }
    }

    @Post('/constant')
    async constantGame(@Body() game: ConstantParameter, @Res() response: Response) {
        await this.gameCreationService
            .saveConstant(game)
            .then(() => {
                response.status(HttpStatus.OK).send();
            })
            .catch(() => {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
            });
    }

    @Post('/')
    @ApiOkResponse({
        description: 'Return if file is stored',
        type: Boolean,
    })
    async save(@Body() game: GameDataDto, @Res() response: Response) {
        await this.gameCreationService
            .gameCreationRoutine(game)
            .then(() => {
                response.status(HttpStatus.OK).send(true);
            })
            .catch(() => {
                response.status(HttpStatus.BAD_GATEWAY).send(false);
            });
    }

    @Delete('/:id')
    async delete(@Param('id') id: string, @Res() response: Response) {
        try {
            await this.listGameService.deleteGameById(id, JSON_PATH);
            response.sendStatus(HttpStatus.NO_CONTENT);
        } catch (err) {
            response.status(HttpStatus.NOT_FOUND).send(err);
        }
    }

    @Delete('/')
    async deleteAll(@Res() response: Response) {
        try {
            await this.listGameService.deleteAllGame(JSON_PATH);
            response.sendStatus(HttpStatus.NO_CONTENT);
        } catch (err) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);
        }
    }
}
