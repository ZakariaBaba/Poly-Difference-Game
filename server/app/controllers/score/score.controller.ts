import { EndGameResult } from '@app/interfaces/end-game-result';
import { DatabaseService } from '@app/services/database/database.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { ScoreService } from '@app/services/score/score.service';
import { GameType } from '@common/constants';
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('score')
export class ScoreController {
    constructor(private databaseService: DatabaseService, private scoreService: ScoreService, private gameManagerService: GameManagerService) {}
    @Get(`/${GameType.Multiplayer}/:id`)
    async getScoreMultiplayer(@Param('id') gameId: string, @Res() response: Response) {
        try {
            const result = await this.databaseService.getScoresByGameId(gameId, GameType.Multiplayer);
            if (result) {
                response.status(HttpStatus.OK).send(result);
            } else {
                response.sendStatus(HttpStatus.NOT_FOUND);
            }
        } catch (err) {
            response.status(HttpStatus.SERVICE_UNAVAILABLE).send(err);
        }
    }

    @Get(`/${GameType.Solo}/:id`)
    async getScoreSolo(@Param('id') gameId: string, @Res() response: Response) {
        try {
            const result = await this.databaseService.getScoresByGameId(gameId, GameType.Solo);
            if (result) {
                response.status(HttpStatus.OK).send(result);
            } else {
                response.sendStatus(HttpStatus.NOT_FOUND);
            }
        } catch (err) {
            response.status(HttpStatus.SERVICE_UNAVAILABLE).send(err);
        }
    }

    @Post('/initScore/:id')
    async getNewScore(@Param('id') gameId: string, @Res() response: Response) {
        try {
            await this.databaseService.deleteByGameId(gameId);
            const result = await this.scoreService.reset(gameId);

            response.status(HttpStatus.OK).send(result);
        } catch (err) {
            response.status(HttpStatus.NOT_FOUND).send(err);
        }
    }

    @Post('/initAllScore/:id')
    async getAllNewScore(@Param('id') gameId: string, @Res() response: Response) {
        try {
            await this.databaseService.deleteByGameId(gameId);
            const result = await this.scoreService.resetAll(gameId);
            response.status(HttpStatus.OK).send(result);
        } catch (err) {
            response.status(HttpStatus.NOT_FOUND).send(err);
        }
    }

    @Post('/updateScore/')
    async getUpdateScore(@Res() response: Response, @Body() endGameResult: EndGameResult) {
        try {
            const result = await this.databaseService.updateScore(endGameResult);
            response.status(HttpStatus.OK).send(result.toString());
        } catch (err) {
            response.sendStatus(HttpStatus.NOT_FOUND);
        }
    }

    @Delete('/')
    async deleteAll(@Res() response: Response) {
        try {
            await this.databaseService.deleteAll();
            response.status(HttpStatus.OK).send();
        } catch (err) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);
        }
    }
}
