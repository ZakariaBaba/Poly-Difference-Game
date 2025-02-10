export abstract class DrawingTool {
    context: CanvasRenderingContext2D;
    strokeStyle: string | CanvasGradient | CanvasPattern;
    lineWidth: number;

    constructor(context: CanvasRenderingContext2D) {
        this.context = context;
        this.strokeStyle = context.strokeStyle;
        this.lineWidth = context.lineWidth;
    }

    protected prepare(): void {
        this.context.strokeStyle = this.strokeStyle;
        this.context.lineCap = 'round';
        this.context.lineWidth = this.lineWidth;
    }

    abstract draw(): void;
}
