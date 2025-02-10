import { NUMBERS_THAT_ARE_SINGLE_DIGIT, RANDOM_FACTOR, RANDOM_NAME_API, SECONDS_IN_MINUTE } from '@app/constants/constant-server';
import { EndGameResult } from '@app/interfaces/end-game-result';
import { GameScore } from '@app/model/dto/schema/game-score';
import { DatabaseService } from '@app/services/database/database.service';
import { Score } from '@common/interfaces/score';
import { Injectable } from '@nestjs/common';
import { fetch } from 'cross-fetch';
import { Observable, Subject } from 'rxjs';
@Injectable()
export class ScoreService {
    scoreUpdatedObservable: Observable<string>;
    private scoreUpdated$: Subject<string> = new Subject<string>();

    constructor(private dataBaseService: DatabaseService) {
        this.scoreUpdatedObservable = this.scoreUpdated$.asObservable();
    }

    async endGameRoutine(endGameResult: EndGameResult): Promise<EndGameResult> {
        try {
            const convertedTime = await this.convertTime(endGameResult.score.timeInSeconds);
            endGameResult.score.formattedTime = convertedTime;
            const result = await this.dataBaseService.updateScore(endGameResult);
            return Promise.resolve(result);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async reset(gameId: string): Promise<GameScore> {
        const generatedGameScore = await this.generateGameScores(gameId);
        await this.dataBaseService.addScore(generatedGameScore);
        this.scoreUpdated$.next(gameId);
        return generatedGameScore;
    }

    async resetAll(gameId: string): Promise<GameScore> {
        const generatedGameScore = await this.generateGameScores(gameId);
        await this.dataBaseService.addScore(generatedGameScore);
        return generatedGameScore;
    }

    async scoreCreationRoutine(gameId: string): Promise<void> {
        const generatedGameScore = await this.generateGameScores(gameId);
        await this.dataBaseService.addScore(generatedGameScore);
    }

    private async generateGameScores(gameId: string): Promise<GameScore> {
        return {
            gameId,
            scoresSolo: await this.generateScores(),
            scores1v1: await this.generateScores(),
        };
    }

    private async generateScores(): Promise<Score[]> {
        const generatedScores = [];
        for (let i = 0; i < 3; i++) {
            generatedScores.push({
                playerName: await this.generateName(),
                timeInSeconds: Math.floor(Math.random() * RANDOM_FACTOR) + 1,
            });
        }
        generatedScores.sort((a, b) => a.timeInSeconds - b.timeInSeconds);
        generatedScores.forEach(async (score) => {
            score.formattedTime = await this.convertTime(score.timeInSeconds);
        });
        return generatedScores;
    }

    private async generateName(): Promise<string> {
        const randomName = fetch(RANDOM_NAME_API);
        return randomName.then(async (response) => response.json()).then((data) => data.results[0].name.first);
    }

    private async convertTime(timeInSeconds: number): Promise<string> {
        const minutes = await this.generateMinutes(timeInSeconds);
        const seconds = await this.generateSeconds(timeInSeconds);
        return minutes + ':' + seconds;
    }

    private async generateMinutes(timeInSeconds: number): Promise<string> {
        return Math.floor(timeInSeconds / SECONDS_IN_MINUTE).toString();
    }

    private async generateSeconds(randomInt: number): Promise<string> {
        if (randomInt % SECONDS_IN_MINUTE < NUMBERS_THAT_ARE_SINGLE_DIGIT) {
            return '0' + (randomInt % SECONDS_IN_MINUTE).toString();
        } else {
            return (randomInt % SECONDS_IN_MINUTE).toString();
        }
    }
}
