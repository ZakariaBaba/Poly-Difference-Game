import { Injectable } from '@angular/core';
import { ClearingTool } from '@app/classes/clearing-tool';
import { ExchangeTool } from '@app/classes/exchange-tool';
import { PathingTool } from '@app/classes/pathing-tool';
import { Timeline } from '@app/classes/timeline';
import { TransferTool } from '@app/classes/transfer-tool';
import { IMAGE_HEIGHT, IMAGE_WIDTH, PENCIL_COLOR, PENCIL_RADIUS } from '@app/constants/constant';
import { DrawEvent } from '@app/interfaces/draw-event';
import { MouseButton } from '@app/interfaces/mouse-button';
import { Tool } from '@app/interfaces/tool';
import { Coordinates } from '@common/interfaces/coordinates';

@Injectable({
    providedIn: 'root',
})
export class ToolService {
    lineWidth: number = PENCIL_RADIUS;
    color: string = PENCIL_COLOR;
    tool: number = Tool.Pencil;
    private path: Coordinates[];
    private mouseDown: boolean;
    private timeline: Timeline = new Timeline();
    private activeEvent: DrawEvent | undefined;

    constructor() {
        this.clearPath();
    }

    onMouseDown(mouseEvent: DrawEvent): void {
        this.activeEvent = mouseEvent;
        this.mouseDown = mouseEvent.event.button === MouseButton.Left;
        this.prepareCanvas(this.activeEvent.drawingContext);
        this.activeEvent.drawingContext.beginPath();
        this.activeEvent.previewContext.beginPath();
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(mouseEvent.event);
            this.path.push(mousePosition);
            this.drawPreview(mouseEvent, mousePosition);
        }
    }

    onMouseMove(mouseEvent: DrawEvent): void {
        if (this.mouseDown && mouseEvent.drawingContext === this.activeEvent?.drawingContext) {
            const mousePosition = this.getPositionFromMouse(mouseEvent.event);

            if (this.checkMouseCoordinates(mousePosition)) {
                this.mouseDown = true;
                this.path.push(mousePosition);
                this.drawPreview(mouseEvent, mousePosition);
            } else {
                this.onMouseUp(mouseEvent);
            }
        }
    }

    onMouseUp(mouseEvent: DrawEvent): void {
        if (this.mouseDown && this.activeEvent) {
            if (mouseEvent.drawingContext === this.activeEvent.drawingContext) {
                const mousePosition = this.getPositionFromMouse(mouseEvent.event);
                this.path.push(mousePosition);
            }
            this.logHistory();
            this.clearCanvas(this.activeEvent.previewContext);
            if (mouseEvent.callback) {
                mouseEvent.callback(this.activeEvent.drawingContext);
            }
        }
        mouseEvent.previewContext.beginPath();
        this.mouseDown = false;
        this.clearPath();
        this.activeEvent?.drawingContext.closePath();
        this.activeEvent?.previewContext.closePath();
        this.activeEvent = undefined;
    }

    undo(): void {
        this.timeline.undo();
    }

    redo(): void {
        this.timeline.redo();
    }

    exchange(context1: CanvasRenderingContext2D, context2: CanvasRenderingContext2D): void {
        const tool = new ExchangeTool(context1, context2);
        this.timeline.assertClear(context2);
        this.timeline.add(tool);
    }
    transfer(context1: CanvasRenderingContext2D, context2: CanvasRenderingContext2D): void {
        const tool = new TransferTool(context1, context2);
        this.timeline.add(tool);
    }

    clear(contex: CanvasRenderingContext2D): void {
        const tool = new ClearingTool(contex);
        this.timeline.add(tool);
    }

    private drawPreview(mouseEvent: DrawEvent, position: Coordinates): void {
        if (this.tool === Tool.Pencil) {
            this.drawLine(mouseEvent.previewContext, position);
        } else if (this.tool === Tool.Eraser) {
            this.drawLine(mouseEvent.drawingContext, position);
        }
    }

    private clearCanvas(ctx: CanvasRenderingContext2D): void {
        ctx.clearRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
    }
    private drawLine(ctx: CanvasRenderingContext2D, point: Coordinates): void {
        this.prepareCanvas(ctx);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
    }

    private prepareCanvas(context: CanvasRenderingContext2D) {
        context.strokeStyle = this.color;
        context.lineWidth = this.lineWidth;
        context.lineCap = this.tool === Tool.Pencil ? 'round' : 'square';
        context.globalCompositeOperation = this.tool === Tool.Pencil ? 'source-over' : 'destination-out';
    }

    private clearPath(): void {
        this.path = [];
    }

    private getPositionFromMouse(event: MouseEvent): Coordinates {
        return { x: event.offsetX, y: event.offsetY };
    }

    private checkMouseCoordinates(mouseCoordinates: Coordinates): boolean {
        if (mouseCoordinates.x <= 0 || mouseCoordinates.x >= IMAGE_WIDTH) {
            return false;
        }
        if (mouseCoordinates.y <= 0 || mouseCoordinates.y >= IMAGE_HEIGHT) {
            return false;
        }
        return true;
    }

    private logHistory() {
        if (this.activeEvent) {
            if (this.tool === Tool.Pencil) {
                this.timeline.add(new PathingTool(this.activeEvent.drawingContext, this.path, false));
            } else if (this.tool === Tool.Eraser) {
                this.timeline.add(new PathingTool(this.activeEvent.drawingContext, this.path, true));
            }
        }
    }
}
