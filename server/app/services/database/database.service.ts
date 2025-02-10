import { NOT_IN_TOP_3 } from '@app/constants/constant-server';
import { EndGameResult } from '@app/interfaces/end-game-result';
import { GameScore, GameScoreDocument } from '@app/model/dto/schema/game-score';
import { GameType } from '@common/constants';
import { Score } from '@common/interfaces/score';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class DatabaseService {
    constructor(@InjectModel(GameScore.name) public gameScoreModel: Model<GameScoreDocument>) {}

    async getScoresByGameId(gameId: string, gameType: GameType): Promise<Score[]> {
        const gameScore = await this.gameScoreModel.findOne({ gameId });
        if (gameScore !== null) {
            if (gameType === GameType.Solo) {
                return gameScore.scoresSolo;
            } else {
                return gameScore.scores1v1;
            }
        } else {
            return null;
        }
    }

    async checkIfScoreIsAlreadyInTop3(endGameResult: EndGameResult): Promise<boolean> {
        if (endGameResult.gameType === GameType.Multiplayer) {
            const foundGame = await this.gameScoreModel.findOne({
                gameId: endGameResult.gameId,
                scores1v1: { $elemMatch: { timeInSeconds: endGameResult.score.timeInSeconds } },
            });
            return foundGame !== null;
        } else {
            const foundGame = await this.gameScoreModel.findOne({
                gameId: endGameResult.gameId,
                scoresSolo: { $elemMatch: { timeInSeconds: endGameResult.score.timeInSeconds } },
            });
            return foundGame !== null;
        }
    }

    async updateScore(endGameResult: EndGameResult): Promise<EndGameResult> {
        const gameId = endGameResult.gameId;
        const isScoreAlreadyInTop3 = await this.checkIfScoreIsAlreadyInTop3(endGameResult);
        if (endGameResult.gameType === GameType.Solo && !isScoreAlreadyInTop3) {
            await this.gameScoreModel.updateOne(
                { gameId },
                {
                    $push: {
                        scoresSolo: {
                            $each: [endGameResult.score],
                            $sort: { timeInSeconds: 1 },
                            $slice: 3,
                        },
                    },
                },
            );
        } else if (endGameResult.gameType === GameType.Multiplayer && !isScoreAlreadyInTop3) {
            await this.gameScoreModel.updateOne(
                { gameId },
                {
                    $push: {
                        scores1v1: {
                            $each: [endGameResult.score],
                            $sort: { timeInSeconds: 1 },
                            $slice: 3,
                        },
                    },
                },
            );
        }
        if (!isScoreAlreadyInTop3) {
            endGameResult.position = await this.getPosition(gameId, endGameResult);
        } else {
            endGameResult.position = NOT_IN_TOP_3;
        }
        return endGameResult;
    }
    async addScore(publicScore: GameScore) {
        await this.gameScoreModel.create(publicScore);
    }

    async deleteAll() {
        await this.gameScoreModel.deleteMany({});
    }

    async deleteByGameId(gameId: string) {
        await this.gameScoreModel.deleteOne({ gameId });
    }

    private async getPosition(gameId: string, endGameResult: EndGameResult): Promise<number> {
        const scores = await this.getScoresByGameId(gameId, endGameResult.gameType);
        const position = scores.findIndex((s) => s.timeInSeconds === endGameResult.score.timeInSeconds);
        if (position !== NOT_IN_TOP_3) {
            return position + 1;
        }
        return position;
    }
}
