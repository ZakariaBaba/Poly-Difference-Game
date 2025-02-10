import { GameDifferences } from '@app/classes/game-differences';
import { Coordinates } from '@common/interfaces/coordinates';
import { Difference } from '@common/interfaces/difference';
import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';

@Injectable()
export class DifferencesService {
    differencesMap: Map<string, GameDifferences> = new Map<string, GameDifferences>();

    setGameDifferences(gameId: string, gameCardId: string) {
        this.differencesMap.set(gameId, new GameDifferences(this.readDifferenceFile(gameCardId)));
    }

    readDifferenceFile(gameCardId: string): Difference[] {
        return JSON.parse(readFileSync('./assets/differences/' + gameCardId + '.json', 'utf-8'));
    }

    deleteGameDifferences(gameId: string) {
        this.differencesMap.delete(gameId);
    }

    getDifferenceCount(gameId: string): number {
        return this.differencesMap.get(gameId).nbFoundDifferences;
    }

    getTotalDifferences(gameId: string): number {
        return this.differencesMap.get(gameId).totalDifferences;
    }

    validateDifference(gameId: string, clickedCoordinates: Coordinates): Difference | undefined {
        return this.differencesMap.get(gameId).validate(clickedCoordinates);
    }
}
