import { Coordinates } from '@common/interfaces/coordinates';
import { Difference } from '@common/interfaces/difference';
import { GameDifferences } from './game-differences';

describe('GameDifferences', () => {
    let object: GameDifferences;
    let expectedDifferences: Difference[];

    beforeEach(async () => {
        expectedDifferences = [
            {
                pixelsPosition: [
                    { x: 0, y: 0 },
                    { x: 1, y: 1 },
                ],
            },
            {
                pixelsPosition: [
                    { x: 2, y: 2 },
                    { x: 3, y: 3 },
                ],
            },
        ];
        object = new GameDifferences(expectedDifferences);
    });

    it('should be defined', () => {
        expect(object).toBeDefined();
    });

    it('constructor() should set totalDifferences and differences to right values', () => {
        expect(object.totalDifferences).toEqual(expectedDifferences.length);
        expect(object['differences']).toEqual(expectedDifferences);
    });

    it('constructor() should do a deep copy of differences', () => {
        object['differences'].pop();
        expect(object['differences'].length).not.toEqual(expectedDifferences.length);
    });

    it('nbFoundDifference should equal to number of differences found', () => {
        const correctCoordinates: Coordinates[] = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        expect(object.nbFoundDifferences).toEqual(0);
        object.validate(correctCoordinates.pop());
        expect(object.nbFoundDifferences).toEqual(1);
        object.validate(correctCoordinates.pop());
        expect(object.nbFoundDifferences).toEqual(2);
    });

    it('validate() should return found Difference if found or undefined if not found', () => {
        const correctCoordinates: Coordinates = { x: 10, y: 9 };
        const errorCoordinates: Coordinates = { x: 1, y: 0 };
        const foundDifference: Difference = { pixelsPosition: [{ x: 10, y: 9 }] };
        object['differences'].push(foundDifference);
        expect(object.validate(errorCoordinates)).toBeFalsy();
        expect(object.validate(correctCoordinates)).toEqual(foundDifference);
        expect(object['differences']).not.toContain(foundDifference);
    });
});
