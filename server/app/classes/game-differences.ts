import { Coordinates } from '@common/interfaces/coordinates';
import { Difference } from '@common/interfaces/difference';

export class GameDifferences {
    totalDifferences: number;
    private differences: Difference[];

    constructor(differences: Difference[]) {
        this.differences = JSON.parse(JSON.stringify(differences));
        this.totalDifferences = this.differences.length;
    }

    get nbFoundDifferences() {
        return this.totalDifferences - this.differences.length;
    }

    validate(coordinates: Coordinates): Difference | undefined {
        for (const [index, difference] of this.differences.entries()) {
            if (this.isInDifference(coordinates, difference)) {
                return this.differences.splice(index, 1)[0];
            }
        }
        return undefined;
    }

    private isInDifference(coordinates: Coordinates, difference: Difference): boolean {
        return difference.pixelsPosition.some((differenceCoordinates: Coordinates) => this.sameCoordinates(differenceCoordinates, coordinates));
    }

    private sameCoordinates(firstCoordinates: Coordinates, secondCoordinates: Coordinates): boolean {
        return firstCoordinates.x === secondCoordinates.x && firstCoordinates.y === secondCoordinates.y;
    }
}
