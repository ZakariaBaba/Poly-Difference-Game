/* eslint-disable prettier/prettier */
export interface DrawEvent {
    event: MouseEvent;
    drawingContext: CanvasRenderingContext2D;
    previewContext: CanvasRenderingContext2D;
    callback?: (arg0: CanvasRenderingContext2D) => void;
}
