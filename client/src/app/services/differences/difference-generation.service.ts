import { Injectable } from '@angular/core';
import { DisjointSet } from '@app/classes/disjoint-set';
import { BYTE_PER_PIXEL, IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants/constant';
import { Row, XLine } from '@app/interfaces/game';
import { Coordinates } from '@common/interfaces/coordinates';
import { Difference } from '@common/interfaces/difference';

@Injectable({
    providedIn: 'root',
})
export class DifferenceGenerationService {
    private differenceData: ImageData = new ImageData(IMAGE_WIDTH, IMAGE_HEIGHT);
    private differences: Map<Row, Row[]> = new Map();
    private differenceSet: DisjointSet<Row> = new DisjointSet();
    private differenceContext: CanvasRenderingContext2D;

    constructor() {
        const differenceCanvas = document.createElement('canvas');
        differenceCanvas.width = IMAGE_WIDTH;
        differenceCanvas.height = IMAGE_HEIGHT;
        this.differenceContext = differenceCanvas.getContext('2d') as CanvasRenderingContext2D;
    }

    getDifferencesCoordinates(): Difference[] {
        const arrayOfDifference: Difference[] = [];

        for (const difference of this.differences.values()) {
            arrayOfDifference.push({ pixelsPosition: this.generateDifferenceCoordinates(difference) });
        }
        return arrayOfDifference;
    }

    getDifferenceAmount(): number {
        return this.differences.size;
    }

    getDifferenceImage(): ImageData {
        return this.differenceData;
    }

    generateNewData(originalImage: ImageData, modifiedImage: ImageData, radius: number): void {
        this.resetContext();
        this.generateDifferenceData(originalImage, modifiedImage, Number(radius));
        this.generateDifferences();
    }

    private generateDifferenceData(originalImage: ImageData, modifiedImage: ImageData, radius: number): void {
        for (let index = 0; index < this.differenceData.data.length; index += BYTE_PER_PIXEL) {
            if (this.areDifferentColor(originalImage.data, modifiedImage.data, index)) {
                this.drawDifferenceImage(this.indexToCoordinate(index), radius);
            }
        }

        this.differenceData = this.differenceContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
    }

    private generateDifferences(): void {
        this.differenceSet.clear();
        const rowsMap = this.generateRows();
        for (const y of rowsMap.keys()) {
            const rows = rowsMap.get(y);
            if (rows) {
                for (const row of rows) {
                    this.differenceSet.makeSet(row);
                    this.joinRows(row, rowsMap.get(y - 1));
                }
            }
        }
        this.differences = this.differenceSet.getSetsContent();
    }

    private joinRows(row: Row, lastRows: Row[] | undefined): void {
        if (lastRows) {
            for (const pastRow of lastRows) {
                if (this.areLinesTouching(row.x, pastRow.x)) {
                    this.differenceSet.union(pastRow, row);
                }
            }
        }
    }

    private generateRows(): Map<number, Row[]> {
        const yMap = new Map();
        for (let y = 0; y < IMAGE_HEIGHT; ++y) {
            const rows: Row[] = [];
            for (let x = 0; x < IMAGE_WIDTH; ++x) {
                if (this.isPixelBlack(x, y)) {
                    x = this.addContiguousLine(rows, x, y);
                }
            }
            if (rows.length > 0) {
                yMap.set(y, rows);
            }
        }
        return yMap;
    }

    private addContiguousLine(rows: Row[], x: number, y: number): number {
        const line: Row = { y, x: { start: x, end: -1 } };
        while (this.isPixelBlack(x, y) && x < IMAGE_WIDTH) {
            line.x.end = x;
            x++;
        }
        rows.push(line);
        return x;
    }

    private indexToCoordinate(index: number): Coordinates {
        return { x: Math.floor(index / BYTE_PER_PIXEL) % IMAGE_WIDTH, y: Math.floor(index / (IMAGE_WIDTH * BYTE_PER_PIXEL)) };
    }

    private generateDifferenceCoordinates(rows: Row[]): Coordinates[] {
        const coordinates: Coordinates[] = [];
        for (const row of rows) {
            this.generateCoordinates(row).map((value) => {
                coordinates.push(value);
            });
        }
        return coordinates;
    }

    private generateCoordinates(row: Row): Coordinates[] {
        const coordinates: Coordinates[] = [];
        for (let x = row.x.start; x <= row.x.end; ++x) {
            coordinates.push({ x, y: row.y });
        }
        return coordinates;
    }

    private drawDifferenceImage(position: Coordinates, radius: number): void {
        if (Number(radius) === 0) {
            this.placePoint(position);
        } else {
            this.makeBlackCircle(position, radius);
        }
    }

    private placePoint(position: Coordinates): void {
        this.differenceContext.fillRect(position.x, position.y, 1, 1);
    }

    private makeBlackCircle(position: Coordinates, radius: number): void {
        this.differenceContext.beginPath();
        this.differenceContext.arc(position.x, position.y, Number(radius) + 1, 0, 2 * Math.PI);
        this.differenceContext.fillStyle = 'rgba(0,0,0,255)';
        this.differenceContext.fill();
    }

    private resetContext(): void {
        this.differenceContext.fillStyle = 'white';
        this.differenceContext.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        this.differenceContext.fillStyle = 'black';
    }

    private areDifferentColor(source1: Uint8ClampedArray, source2: Uint8ClampedArray, position: number): boolean {
        let same = true;
        for (let i = position; i < position + 3; ++i) {
            same = same && source1[i] === source2[i];
        }
        return !same;
    }

    private isPixelBlack(x: number, y: number): boolean {
        return this.differenceData.data[y * IMAGE_WIDTH * BYTE_PER_PIXEL + x * BYTE_PER_PIXEL] < 2;
    }

    private areLinesTouching(line1: XLine, line2: XLine): boolean {
        return (
            this.isInLine(line1.start, line2) ||
            this.isInLine(line1.end, line2) ||
            this.isInLine(line2.start, line1) ||
            this.isInLine(line2.end, line1)
        );
    }

    private isInLine(position: number, line: { start: number; end: number }) {
        return position >= line.start - 1 && position <= line.end + 1;
    }
}
