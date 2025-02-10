import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants/constant';
import { DrawingTool } from './drawing-tool';

export class TransferTool extends DrawingTool {
    context: CanvasRenderingContext2D;
    source: CanvasRenderingContext2D;

    constructor(context: CanvasRenderingContext2D, source: CanvasRenderingContext2D) {
        super(context);
        this.source = source;
    }

    draw(): void {
        this.prepare();
        const image = this.source.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        this.context.putImageData(image, 0, 0);
    }
}
