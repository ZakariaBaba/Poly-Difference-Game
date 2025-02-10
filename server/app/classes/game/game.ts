import { Timer } from '@app/classes/timer/timer';
import { EndGameResult } from '@app/interfaces/end-game-result';
import { GameMode, GameType } from '@common/constants';
import { Coordinates } from '@common/interfaces/coordinates';
import { Difference } from '@common/interfaces/difference';
import { DifferencesCount } from '@common/interfaces/differences-count';
import { ConstantParameter } from '@common/interfaces/public-game';

export abstract class Game {
    totalDifferences: number;
    timer: Timer;
    protected differences: Difference[];
    protected constants: ConstantParameter;

    constructor(differences: Difference[], constants: ConstantParameter) {
        this.timer = new Timer();
        this.differences = JSON.parse(JSON.stringify(differences));
        this.totalDifferences = this.differences.length;
        this.constants = JSON.parse(JSON.stringify(constants));
    }

    get allDifferences(): Difference[] {
        return this.differences;
    }

    get differencesCount(): DifferencesCount {
        return { total: this.numberOfFoundDifferences, host: this.numberOfFoundDifferences };
    }

    get numberOfFoundDifferences() {
        return this.totalDifferences - this.differences.length;
    }

    get gameConstants(): ConstantParameter {
        return this.constants;
    }

    abstract get timerInitialValue(): number;

    protected randomItem<T>(items: T[]): T {
        return items[Math.floor(Math.random() * items.length)];
    }

    protected isInDifference(coordinates: Coordinates, difference: Difference): boolean {
        return difference.pixelsPosition.some((differenceCoordinates: Coordinates) => this.sameCoordinates(differenceCoordinates, coordinates));
    }

    protected sameCoordinates(firstCoordinates: Coordinates, secondCoordinates: Coordinates): boolean {
        return firstCoordinates.x === secondCoordinates.x && firstCoordinates.y === secondCoordinates.y;
    }

    abstract getEndGameResult(): EndGameResult;

    abstract isFinished(): boolean;

    abstract validate(coordinates: Coordinates, socketId: string): Difference | undefined;

    abstract typeOfGame(): GameType;

    abstract modeOfGame(): GameMode;
}
