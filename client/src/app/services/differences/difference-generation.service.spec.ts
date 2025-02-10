import { TestBed } from '@angular/core/testing';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants/constant';
import { Coordinates } from '@common/interfaces/coordinates';
import { DifferenceGenerationService } from './difference-generation.service';

/* eslint-disable @typescript-eslint/no-magic-numbers*/

describe('DifferenceGestionService', () => {
    let service: DifferenceGenerationService;
    let orginalCanvas: HTMLCanvasElement;
    let modifiedCanvas: HTMLCanvasElement;
    let modifiedContext: CanvasRenderingContext2D;
    let originalContext: CanvasRenderingContext2D;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DifferenceGenerationService);

        orginalCanvas = document.createElement('canvas') as HTMLCanvasElement;
        modifiedCanvas = document.createElement('canvas');

        originalContext = prepareCanvas(orginalCanvas);
        modifiedContext = prepareCanvas(modifiedCanvas);

        clearCanvas(originalContext);
        clearCanvas(modifiedContext);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getDifferenceAmount should return current difference amount', () => {
        expect(service.getDifferenceAmount()).toBe(0);
        service['differences'].set({ y: 1, x: { start: 0, end: 1 } }, []);
        expect(service.getDifferenceAmount()).toBe(1);
    });

    it('single different images should return 1 difference', () => {
        modifiedContext.fillRect(0, 0, 2, 2);
        service.generateNewData(
            originalContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT),
            modifiedContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT),
            0,
        );
        expect(service.getDifferenceAmount()).toBe(1);
    });

    it('same different images should return 0 difference', () => {
        service.generateNewData(
            originalContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT),
            modifiedContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT),
            0,
        );
        expect(service.getDifferenceAmount()).toBe(0);
    });

    it('2 differences images should return 2 difference', () => {
        modifiedContext.fillRect(0, 0, 2, 2);
        modifiedContext.fillRect(10, 10, 2, 2);
        service.generateNewData(
            originalContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT),
            modifiedContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT),
            0,
        );
        expect(service.getDifferenceAmount()).toBe(2);
    });
    it('diagonals connect', () => {
        modifiedContext.fillRect(0, 0, 2, 2);
        modifiedContext.fillRect(2, 2, 2, 2);
        service.generateNewData(
            originalContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT),
            modifiedContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT),
            0,
        );
        expect(service.getDifferenceAmount()).toBe(1);
    });

    it('same x gives 2 differences', () => {
        modifiedContext.fillRect(0, 0, 2, 2);
        modifiedContext.fillRect(0, 3, 2, 2);
        service.generateNewData(
            originalContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT),
            modifiedContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT),
            0,
        );
        expect(service.getDifferenceAmount()).toBe(2);
    });

    it('same y gives 2 differences', () => {
        modifiedContext.fillRect(0, 0, 2, 2);
        modifiedContext.fillRect(3, 0, 2, 2);
        service.generateNewData(
            originalContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT),
            modifiedContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT),
            0,
        );
        expect(service.getDifferenceAmount()).toBe(2);
    });

    it('extra radius 3 connects differences 6 pixel appart', () => {
        modifiedContext.fillRect(0, 0, 1, 1);
        modifiedContext.fillRect(0, 8, 1, 1);
        service.generateNewData(
            originalContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT),
            modifiedContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT),
            3,
        );
        expect(service.getDifferenceAmount()).toBe(1);
    });

    it('extra radius 3 should not connects differences 9 pixel appart', () => {
        modifiedContext.fillRect(0, 0, 1, 1);
        modifiedContext.fillRect(0, 11, 1, 1);
        service.generateNewData(
            originalContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT),
            modifiedContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT),
            3,
        );
        expect(service.getDifferenceAmount()).toBe(2);
    });

    const prepareCanvas = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
        canvas.width = IMAGE_WIDTH;
        canvas.height = IMAGE_HEIGHT;
        return canvas.getContext('2d') as CanvasRenderingContext2D;
    };
    const clearCanvas = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        ctx.fillStyle = 'black';
    };
    it('getDifferencesCoordinates should return the right coordinates for 1 difference', () => {
        modifiedContext.fillRect(0, 1, 2, 2);
        service.generateNewData(
            originalContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT),
            modifiedContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT),
            0,
        );
        const xyDifference = service.getDifferencesCoordinates();
        const expectedCoordinate1: Coordinates = { x: 0, y: 1 };
        expect(xyDifference.length).toBe(1);
        expect(
            xyDifference.some((value) => {
                return value.pixelsPosition.length === 4;
            }),
        ).toBeTruthy();
        expect(
            xyDifference.some((value) => {
                // eslint-disable-next-line @typescript-eslint/no-shadow
                return value.pixelsPosition.some((value) => {
                    return value.x === expectedCoordinate1.x && value.y === expectedCoordinate1.y;
                });
            }),
        ).toBeTruthy();
    });
    it('getDifferenceImage returns differenceData', () => {
        modifiedContext.fillRect(0, 0, 2, 2);
        modifiedContext.fillRect(0, 3, 2, 2);
        service.generateNewData(
            originalContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT),
            modifiedContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT),
            0,
        );
        const data = service.getDifferenceImage();
        expect(data).toBe(service['differenceData']);
    });
});
