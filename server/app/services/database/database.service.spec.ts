import { NOT_IN_TOP_3 } from '@app/constants/constant-server';
import { GameScore, GameScoreDocument, gameScoreSchema } from '@app/model/dto/schema/game-score';
import { GameType } from '@common/constants';
import { Score } from '@common/interfaces/score';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { DatabaseService } from './database.service';

const DELAY_BEFORE_CLOSING_CONNECTION = 200;

describe('DatabaseService', () => {
    let mongoServer: MongoMemoryServer;
    let service: DatabaseService;
    let connection: Connection;
    let gameScoreModel: Model<GameScoreDocument>;
    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        const module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: GameScore.name, schema: gameScoreSchema }]),
            ],
            providers: [DatabaseService],
        }).compile();

        service = module.get<DatabaseService>(DatabaseService);
        gameScoreModel = module.get<Model<GameScoreDocument>>(getModelToken(GameScore.name));
        connection = await module.get(getConnectionToken());
    });

    afterEach((done) => {
        setTimeout(async () => {
            await connection.close();
            await mongoServer.stop();
            done();
        }, DELAY_BEFORE_CLOSING_CONNECTION);
    });

    it('should be defined', () => {
        expect(gameScoreModel).toBeDefined();
        expect(service).toBeDefined();
    });

    it('getScoreByGameId() return score with the specified score code for solo score', async () => {
        const score = generateGameScore();
        await gameScoreModel.create(score);
        expect(await service.getScoresByGameId(score.gameId, GameType.Solo)).toEqual(expect.objectContaining(score.scoresSolo));
    });

    it('getScoreByGameId() return score with the specified score code for solo game', async () => {
        const score = generateGameScore();
        await gameScoreModel.create(score);
        expect(await service.getScoresByGameId(score.gameId, GameType.Multiplayer)).toEqual(expect.objectContaining(score.scores1v1));
    });

    it('getScoreByGameId() return undefined when no score is found', async () => {
        expect(await service.getScoresByGameId('fakeGameId', GameType.Solo)).toBe(null);
        expect(await service.getScoresByGameId('fakeGameId', GameType.Multiplayer)).toBe(null);
    });

    it('updateScore() update score for solo game if there is a best score', async () => {
        const firstScore = {
            playerName: getRandomString(),
            timeInSeconds: 12,
        };
        const secondScore = {
            playerName: getRandomString(),
            timeInSeconds: 13,
        };
        const thirdScore = {
            playerName: getRandomString(),
            timeInSeconds: 14,
        };
        const gameScore = {
            gameId: getRandomString(),
            scoresSolo: [firstScore, secondScore, thirdScore],
            scores1v1: {} as Score[],
        };
        const generatedEndGameResult = {
            gameId: gameScore.gameId,
            gameType: GameType.Solo,
            score: {
                playerName: getRandomString(),
                timeInSeconds: 11,
            },
        };
        await gameScoreModel.create(gameScore);
        const receivedEndGameResult = await service.updateScore(generatedEndGameResult);
        expect(receivedEndGameResult).toEqual(expect.objectContaining(generatedEndGameResult));
        expect(receivedEndGameResult.position).toEqual(1);
    });

    it('updateScore() update score for solo game if there is no best score', async () => {
        const firstScore = {
            playerName: getRandomString(),
            timeInSeconds: 12,
        };
        const secondScore = {
            playerName: getRandomString(),
            timeInSeconds: 13,
        };
        const thirdScore = {
            playerName: getRandomString(),
            timeInSeconds: 14,
        };
        const gameScore = {
            gameId: getRandomString(),
            scoresSolo: [firstScore, secondScore, thirdScore],
            scores1v1: {} as Score[],
        };
        const generatedEndGameResult = {
            gameId: gameScore.gameId,
            gameType: GameType.Solo,
            score: {
                playerName: getRandomString(),
                timeInSeconds: 15,
            },
        };
        await gameScoreModel.create(gameScore);
        const receivedEndGameResult = await service.updateScore(generatedEndGameResult);
        expect(receivedEndGameResult).toEqual(expect.objectContaining(generatedEndGameResult));
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(receivedEndGameResult.position).toEqual(-1);
    });

    it('updateScore() update score for multiplayer game if there is a best score', async () => {
        const firstScore = {
            playerName: getRandomString(),
            timeInSeconds: 12,
        };
        const secondScore = {
            playerName: getRandomString(),
            timeInSeconds: 13,
        };
        const thirdScore = {
            playerName: getRandomString(),
            timeInSeconds: 14,
        };
        const gameScore = {
            gameId: getRandomString(),
            scoresSolo: {} as Score[],
            scores1v1: [firstScore, secondScore, thirdScore],
        };
        const generatedEndGameResult1 = {
            gameId: gameScore.gameId,
            gameType: GameType.Multiplayer,
            score: {
                playerName: getRandomString(),
                timeInSeconds: 11,
            },
        };
        const generatedEndGameResult2 = {
            gameId: gameScore.gameId,
            gameType: GameType.Multiplayer,
            score: {
                playerName: getRandomString(),
                timeInSeconds: 9,
            },
        };
        await gameScoreModel.create(gameScore);
        const receivedEndGameResult1 = await service.updateScore(generatedEndGameResult1);
        const receivedEndGameResult2 = await service.updateScore(generatedEndGameResult2);
        expect(receivedEndGameResult1).toEqual(expect.objectContaining(generatedEndGameResult1));
        expect(receivedEndGameResult1.position).toEqual(1);
        expect(receivedEndGameResult2.position).toEqual(1);
    });

    it('updateScore() update score for multiplayer game if there is no best score', async () => {
        const firstScore = {
            playerName: getRandomString(),
            timeInSeconds: 12,
        };
        const secondScore = {
            playerName: getRandomString(),
            timeInSeconds: 13,
        };
        const thirdScore = {
            playerName: getRandomString(),
            timeInSeconds: 14,
        };
        const gameScore = {
            gameId: getRandomString(),
            scoresSolo: {} as Score[],
            scores1v1: [firstScore, secondScore, thirdScore],
        };
        const generatedEndGameResult = {
            gameId: gameScore.gameId,
            gameType: GameType.Multiplayer,
            score: {
                playerName: getRandomString(),
                timeInSeconds: 15,
            },
        };
        await gameScoreModel.create(gameScore);
        const receivedEndGameResult = await service.updateScore(generatedEndGameResult);
        expect(receivedEndGameResult).toEqual(expect.objectContaining(generatedEndGameResult));
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(receivedEndGameResult.position).toEqual(NOT_IN_TOP_3);
    });

    it('updateScore() shouldnt update score if it is already in top3', async () => {
        const firstScore = {
            playerName: getRandomString(),
            timeInSeconds: 12,
        };
        const secondScore = {
            playerName: getRandomString(),
            timeInSeconds: 13,
        };
        const thirdScore = {
            playerName: getRandomString(),
            timeInSeconds: 14,
        };
        const gameScore = {
            gameId: getRandomString(),
            scoresSolo: {} as Score[],
            scores1v1: [firstScore, secondScore, thirdScore],
        };
        const generatedEndGameResult = {
            gameId: gameScore.gameId,
            gameType: GameType.Multiplayer,
            score: {
                playerName: getRandomString(),
                timeInSeconds: 12,
            },
        };
        await gameScoreModel.create(gameScore);
        const receivedEndGameResult = await service.updateScore(generatedEndGameResult);
        expect(receivedEndGameResult.position).toEqual(NOT_IN_TOP_3);
    });

    it('addScore() should add gameScore', async () => {
        const gameScore = generateGameScore();
        await service.addScore(gameScore);
        const receivedGameScore = await gameScoreModel.findOne({ gameId: gameScore.gameId });
        expect(receivedGameScore).toEqual(expect.objectContaining(gameScore));
    });

    it('deleteAll() should delete all gameScore', async () => {
        const gameScore1 = generateGameScore();
        const gameScore2 = generateGameScore();
        await gameScoreModel.create(gameScore1);
        await gameScoreModel.create(gameScore2);
        await service.deleteAll();
        expect(await gameScoreModel.find()).toEqual([]);
    });

    it('deleteByGameId() should delete gameScore by gameId', async () => {
        const gameScore1 = generateGameScore();
        const gameScore2 = generateGameScore();
        await gameScoreModel.create(gameScore1);
        await gameScoreModel.create(gameScore2);
        await service.deleteByGameId(gameScore1.gameId);
        expect(await gameScoreModel.find()).toEqual(expect.arrayContaining([expect.objectContaining(gameScore2)]));
    });
});

const generateGameScore = (): GameScore => ({
    gameId: getRandomString(),
    scores1v1: [
        {
            playerName: getRandomString(),
            timeInSeconds: getRandomNumber(),
        },
    ],
    scoresSolo: [
        {
            playerName: getRandomString(),
            timeInSeconds: getRandomNumber(),
        },
    ],
});

const BASE_36 = 36;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const getRandomNumber = (): number => Math.floor(Math.random() * 100);
