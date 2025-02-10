import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants/constant';
import { DrawingTool } from './drawing-tool';

export class ClearingTool extends DrawingTool {
    context: CanvasRenderingContext2D;
    strokeStyle: string | CanvasGradient | CanvasPattern;

    draw(): void {
        this.prepare();
        this.context.clearRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
    }
}
