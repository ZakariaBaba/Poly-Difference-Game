import { Coordinates } from '@common/interfaces/coordinates';
import { DrawingTool } from './drawing-tool';

export class PathingTool extends DrawingTool {
    context: CanvasRenderingContext2D;
    midPoints: Coordinates[];
    strokeStyle: string | CanvasGradient | CanvasPattern;
    isEraser: boolean;

    constructor(context: CanvasRenderingContext2D, pointList: Coordinates[], isEraser: boolean) {
        super(context);
        this.midPoints = pointList;
        this.isEraser = isEraser;
    }

    draw() {
        this.prepare();
        if (this.isEraser) {
            this.context.lineCap = 'square';
            this.context.globalCompositeOperation = 'destination-out';
        }
        this.context.beginPath();
        for (const position of this.midPoints) {
            this.context.lineTo(position.x, position.y);
            this.context.stroke();
            this.context.beginPath();
            this.context.moveTo(position.x, position.y);
        }
        this.context.closePath();
        this.context.globalCompositeOperation = 'source-over';
    }
}
