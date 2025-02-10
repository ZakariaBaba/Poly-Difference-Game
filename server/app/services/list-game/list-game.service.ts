import {
    ENCODING,
    GITKEEP,
    IMAGE_PATH,
    JSON_EXT,
    JSON_PATH,
    MODIFIED_EXT,
    NUMBER_OF_GAMES_PER_PAGE,
    ORIGINAL_EXT,
    RELATIVE_PATH_TO_DIFFERENCES,
} from '@app/constants/constant-server';
import { GameData } from '@app/interfaces/game-data';
import { GameDataDto } from '@app/model/dto/game-data.dto';
import { DatabaseService } from '@app/services/database/database.service';
import { GameCardInfo } from '@common/interfaces/game-card-info';
import { PublicGame } from '@common/interfaces/public-game';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { readFile, readFileSync, writeFileSync } from 'fs';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class ListGameService {
    gameDeletedObservable: Observable<string>;

    private gameDeleted$: Subject<string> = new Subject<string>();
    private gameData: GameDataDto[];
    private gamesId: Set<string> = new Set<string>();
    private pendingGames: Set<string> = new Set<string>();

    constructor(private databaseService: DatabaseService) {
        this.gameDeletedObservable = this.gameDeleted$.asObservable();
        this.setGameData();
    }

    getGamesId(): Set<string> {
        return this.gamesId;
    }

    async getListOfGames(index?: number): Promise<GameCardInfo> {
        await this.setGameData();
        if (index > this.gameData.length) {
            return Promise.reject('Index out of range');
        } else {
            const data: GameCardInfo = {} as GameCardInfo;
            data.listOfGames = this.gameData.slice(index, Number(index) + NUMBER_OF_GAMES_PER_PAGE) as PublicGame[];
            data.listOfGames.forEach((game) => {
                game.isWaiting = this.pendingGames.has(game.id);
            });
            data.isThereMoreGames = await this.isThereMoreGames(index);
            return data;
        }
    }

    async read(path: string): Promise<string> {
        return new Promise((resolve, reject) => {
            readFile(path, 'utf-8', async (error, data) => {
                if (error) {
                    reject('ERROR');
                } else {
                    resolve(data);
                }
            });
        });
    }

    setGameStatus(id: string, status: boolean): void {
        if (status) {
            this.pendingGames.add(id);
        } else {
            this.pendingGames.delete(id);
        }
    }

    async getGameById(id: string): Promise<GameDataDto> {
        await this.setGameData();
        const foundGame = this.gameData.find((game) => game.id === id);
        if (foundGame) {
            return Promise.resolve(foundGame);
        } else {
            return Promise.reject();
        }
    }

    async deleteGameById(id: string, path: string): Promise<void> {
        const gamesData = readFileSync(path, ENCODING);
        let listOfGames: GameDataDto[] = JSON.parse(gamesData);

        listOfGames = this.gameData.filter((game) => game.id !== id);
        const newGamesData: string = JSON.stringify({ listOfGames });
        writeFileSync(path, newGamesData, ENCODING);

        this.deleteDifference(id);
        this.deleteImageOriginal(id);
        this.deleteImageModified(id);
        this.databaseService.deleteByGameId(id);
        this.gameDeleted$.next(id);
        this.gamesId.delete(id);
        if (gamesData === newGamesData) {
            return Promise.reject('Game not found');
        } else {
            return Promise.resolve();
        }
    }

    async deleteAllGame(path: string): Promise<void> {
        const newGamesData = JSON.stringify({ listOfGames: [] });
        writeFileSync(path, newGamesData, ENCODING);
        await this.deleteAllDifference();
        await this.deleteAllImage();
        this.databaseService.deleteAll();
        this.gameDeleted$.next(path);
        this.gamesId.clear();
    }

    private async isThereMoreGames(index: number): Promise<boolean> {
        return index + NUMBER_OF_GAMES_PER_PAGE < this.gameData.length;
    }

    private async setGameData(): Promise<void> {
        const gameData: GameData = JSON.parse(await this.read(JSON_PATH));
        this.gameData = gameData.listOfGames;
        this.gameData.forEach((game) => {
            this.gamesId.add(game.id);
        });
    }

    private async deleteAllDifference() {
        return await fs.promises.readdir(RELATIVE_PATH_TO_DIFFERENCES).then(async (f) =>
            Promise.all(
                f.map(async (file) => {
                    if (!file.includes(GITKEEP)) {
                        fs.promises.unlink(`${RELATIVE_PATH_TO_DIFFERENCES}${file}`);
                    }
                }),
            ),
        );
    }

    private async deleteAllImage() {
        return await fs.promises.readdir(IMAGE_PATH).then(async (f) =>
            Promise.all(
                f.map(async (file) => {
                    if (!file.includes(GITKEEP)) {
                        fs.promises.unlink(`${IMAGE_PATH}${file}`);
                    }
                }),
            ),
        );
    }

    private async deleteDifference(id: string): Promise<void> {
        fs.unlink(RELATIVE_PATH_TO_DIFFERENCES + id + JSON_EXT, () => {
            return;
        });
    }

    private async deleteImageOriginal(id: string): Promise<void> {
        fs.unlink(IMAGE_PATH + id + ORIGINAL_EXT, () => {
            return;
        });
    }

    private async deleteImageModified(id: string): Promise<void> {
        const filename = IMAGE_PATH + id + MODIFIED_EXT;
        fs.unlink(filename, () => {
            return;
        });
    }
}
