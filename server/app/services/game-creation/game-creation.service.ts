import {
    BAD_IMAGE_ERROR,
    BASE64,
    CONSTANT_PATH,
    ENCODING,
    FILE_GENERATION_ERROR,
    GENERIC_REQUEST_ERROR,
    IMAGE_DEPTH,
    IMAGE_HEIGHT,
    IMAGE_PATH,
    IMAGE_WIDTH,
    JSON_EXT,
    JSON_PATH,
    JSON_WRITING_ERROR,
    MODIFIED_EXT,
    MODIFIED_IMAGE_PATH_SERVER,
    ORIGINAL_EXT,
    ORIGINAL_IMAGE_PATH_SERVER,
    RELATIVE_PATH_TO_DIFFERENCES,
} from '@app/constants/constant-server';
import { ImageInfo } from '@app/interfaces/image-data';
import { GameDataDto } from '@app/model/dto/game-data.dto';
import { ScoreService } from '@app/services/score/score.service';
import { Difference } from '@common/interfaces/difference';
import { ConstantParameter, PublicGame } from '@common/interfaces/public-game';
import { Injectable } from '@nestjs/common';
import { decode } from 'bmp-js';
import { readFileSync, writeFileSync } from 'fs';
import { Observable, Subject } from 'rxjs';
import { v4 as uuid } from 'uuid';

@Injectable()
export class GameCreationService {
    gamesId: Set<string> = new Set<string>();
    gameCreatedObservable: Observable<boolean>;
    private gameCreated$: Subject<boolean> = new Subject<boolean>();

    constructor(private scoreService: ScoreService) {
        this.gameCreatedObservable = this.gameCreated$.asObservable();
    }

    async saveConstant(constant: ConstantParameter) {
        try {
            if (constant) {
                writeFileSync(CONSTANT_PATH, JSON.stringify(constant), ENCODING);
            } else {
                throw new TypeError(JSON_WRITING_ERROR);
            }
        } catch (error) {
            throw TypeError(JSON_WRITING_ERROR);
        }
    }

    async gameCreationRoutine(game: GameDataDto) {
        game.id = uuid();
        const createdGame: PublicGame = {
            id: game.id,
            name: game.name,
            originalSource: ORIGINAL_IMAGE_PATH_SERVER + game.id,
            modifiedSource: MODIFIED_IMAGE_PATH_SERVER + game.id,
            numberOfDifference: game.numberOfDifference,
            isWaiting: false,
        };
        const image: ImageInfo = {
            original: game.originalImage,
            modified: game.modifiedImage,
        };
        const difference = game.arrayOfDifference;

        this.save(createdGame);
        this.saveCoordinate(difference, createdGame.id);
        this.upload(image, createdGame.id);
        await this.scoreService.scoreCreationRoutine(game.id);
        this.gameCreated$.next(true);
    }

    async isFileOk(file: Express.Multer.File): Promise<void> {
        try {
            const bmpData = decode(file.buffer);
            if (bmpData.height === IMAGE_HEIGHT && bmpData.width === IMAGE_WIDTH && bmpData.bitPP === IMAGE_DEPTH) {
                return Promise.resolve();
            } else {
                return Promise.reject(BAD_IMAGE_ERROR);
            }
        } catch (err) {
            return Promise.reject(GENERIC_REQUEST_ERROR);
        }
    }

    private async upload(image: ImageInfo, id: string) {
        try {
            writeFileSync(IMAGE_PATH + id + ORIGINAL_EXT, image.original.replace(/^data:image\/png;base64,/, ''), BASE64);
            writeFileSync(IMAGE_PATH + id + MODIFIED_EXT, image.modified.replace(/^data:image\/png;base64,/, ''), BASE64);
        } catch (error) {
            throw TypeError(FILE_GENERATION_ERROR);
        }
    }
    private save(game: PublicGame) {
        try {
            const data = readFileSync(JSON_PATH, ENCODING);
            const listOfGames: GameDataDto[] = JSON.parse(data);
            listOfGames['listOfGames'].push(game);
            const jsonData: string = JSON.stringify(listOfGames);
            writeFileSync(JSON_PATH, jsonData, ENCODING);
            this.gamesId.add(game.id);
        } catch (error) {
            throw TypeError(JSON_WRITING_ERROR);
        }
    }

    private async saveCoordinate(difference: Difference[], id: string) {
        try {
            if (id) {
                writeFileSync(RELATIVE_PATH_TO_DIFFERENCES + id + JSON_EXT, JSON.stringify(difference), 'utf-8');
            } else {
                throw new TypeError(JSON_WRITING_ERROR);
            }
        } catch (error) {
            throw TypeError(JSON_WRITING_ERROR);
        }
    }
}
