import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants/constant';
import { DrawingTool } from './drawing-tool';

export class ExchangeTool extends DrawingTool {
    context: CanvasRenderingContext2D;
    context2: CanvasRenderingContext2D;

    constructor(context: CanvasRenderingContext2D, context2: CanvasRenderingContext2D) {
        super(context);
        this.context2 = context2;
    }

    draw(): void {
        this.prepare();
        const image1 = this.context.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        this.context.putImageData(this.context2.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT), 0, 0);
        this.context2.putImageData(image1, 0, 0);
    }
}
