/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ClearingTool } from '@app/classes/clearing-tool';
import { ExchangeTool } from '@app/classes/exchange-tool';
import { PathingTool } from '@app/classes/pathing-tool';
import { TransferTool } from '@app/classes/transfer-tool';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants/constant';
import { DrawEvent } from '@app/interfaces/draw-event';
import { Tool } from '@app/interfaces/tool';

import { ToolService } from './tool.service';

describe('ToolService', () => {
    let service: ToolService;
    let originalContextStub: CanvasRenderingContext2D;
    let modifiedContextStub: CanvasRenderingContext2D;
    let drawEvent: DrawEvent;
    let falseEvent: DrawEvent;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ToolService);
        originalContextStub = CanvasTestHelper.createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        modifiedContextStub = CanvasTestHelper.createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        drawEvent = {
            event: {
                type: 'mousedown',
                offsetX: 20,
                offsetY: 50,
                button: 0,
            } as MouseEvent,
            drawingContext: originalContextStub,
            previewContext: modifiedContextStub,
        };
        falseEvent = {
            event: {
                type: 'mousedown',
                offsetX: 50,
                offsetY: 0,
                button: 0,
            } as MouseEvent,
            drawingContext: originalContextStub,
            previewContext: modifiedContextStub,
        };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('onMouseDown', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service, 'drawPreview');
        service.onMouseDown(drawEvent);
        expect(service['mouseDown']).toBeTruthy();
        expect(service['activeEvent']).toEqual(drawEvent);
        expect(service['path']).toEqual([{ x: 20, y: 50 }]);
        expect(spy).toHaveBeenCalled();
    });

    it('onMouseMove if in canvas should push data in path and call draw preview', () => {
        const mouseEvent: DrawEvent = {
            event: {
                type: 'mousedown',
                offsetX: 50,
                offsetY: 50,
                button: 0,
            } as MouseEvent,
            drawingContext: originalContextStub,
            previewContext: modifiedContextStub,
        };
        const mouseEvent2: DrawEvent = {
            event: {
                type: 'mousedown',
                offsetX: 10,
                offsetY: 50,
                button: 0,
            } as MouseEvent,
            drawingContext: originalContextStub,
            previewContext: modifiedContextStub,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service, 'drawPreview');

        service['activeEvent'] = mouseEvent;
        service['mouseDown'] = true;
        service.onMouseMove(mouseEvent);
        service.onMouseMove(drawEvent);
        service.onMouseMove(mouseEvent2);

        expect(service['path']).toEqual([
            { x: 50, y: 50 },
            { x: 20, y: 50 },
            { x: 10, y: 50 },
        ]);
        expect(spy).toHaveBeenCalled();
    });
    it('onMouseMove should call onMouseUp if event is out of canvas', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service, 'onMouseUp');

        service['activeEvent'] = falseEvent;
        service['mouseDown'] = true;
        service.onMouseMove(falseEvent);

        expect(service['path']).toEqual([]);
        expect(spy).toHaveBeenCalled();
    });
    it('onMouseUp should log history and clear canvas', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        service['activeEvent'] = drawEvent;
        service['mouseDown'] = true;
        const clearCanvasSpy = spyOn<any>(service, 'clearCanvas');
        const logHistorySpy = spyOn<any>(service, 'logHistory');
        service.onMouseUp(drawEvent);

        expect(service['path']).toEqual([]);
        expect(clearCanvasSpy).toHaveBeenCalled();
        expect(logHistorySpy).toHaveBeenCalled();
    });
    it('Undo should call timeline undo', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service['timeline'], 'undo').and.callThrough();
        service['timeline']['history'].push(new ClearingTool(originalContextStub));
        service['timeline']['history'].push(new ClearingTool(originalContextStub));
        service.undo();
        expect(spy).toHaveBeenCalled();
    });
    it('Redo should call timeline redo', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service['timeline'], 'redo').and.callThrough();
        service['timeline']['undone'].push(new ClearingTool(originalContextStub));
        service.redo();
        expect(spy).toHaveBeenCalled();
    });
    it('Exchange should push ExchangeTool in the timeline', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service['timeline'], 'add').and.callThrough();
        service.exchange(originalContextStub, modifiedContextStub);
        expect(spy).toHaveBeenCalled();
        expect(service['timeline']['history'].at(2)).toBeInstanceOf(ExchangeTool);
    });
    it('transfer should push TransferTool in the timeline', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service['timeline'], 'add').and.callThrough();
        service.transfer(originalContextStub, modifiedContextStub);
        expect(spy).toHaveBeenCalled();
        expect(service['timeline']['history'].at(1)).toBeInstanceOf(TransferTool);
    });
    it('clear should push ClearingTool in the timeline', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service['timeline'], 'add').and.callThrough();
        service.clear(originalContextStub);
        expect(spy).toHaveBeenCalled();
        expect(service['timeline']['history'].at(1)).toBeInstanceOf(ClearingTool);
    });
    it('drawPreview should draw on preview context if pencil', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service, 'drawLine');
        service['tool'] = Tool.Pencil;
        service['drawPreview'](drawEvent, { x: 20, y: 50 });
        expect(spy).toHaveBeenCalledWith(drawEvent.previewContext, { x: 20, y: 50 });
    });

    it('drawPreview should draw on drawing context if eraser', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service, 'drawLine');
        service['tool'] = Tool.Eraser;
        service['drawPreview'](drawEvent, { x: 20, y: 50 });
        expect(spy).toHaveBeenCalledWith(drawEvent.drawingContext, { x: 20, y: 50 });
    });
    it('drawPreview should draw on drawing context if eraser', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service, 'drawLine');
        service['tool'] = Tool.Eraser;
        service['drawPreview'](drawEvent, { x: 20, y: 50 });
        expect(spy).toHaveBeenCalledWith(drawEvent.drawingContext, { x: 20, y: 50 });
    });
    it('clearCanvas should clear the canvas', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        service['drawPreview'](drawEvent, { x: 20, y: 50 });
        service['clearCanvas'](drawEvent.drawingContext);
        expect(drawEvent.drawingContext).toEqual(drawEvent.previewContext);
    });
    it('checkMouseCoordinate should check return false if out of bound', () => {
        expect(service['checkMouseCoordinates']({ x: 0, y: 50 })).toBeFalse();
        expect(service['checkMouseCoordinates']({ x: 50, y: 0 })).toBeFalse();
        expect(service['checkMouseCoordinates']({ x: 10000, y: 50 })).toBeFalse();
        expect(service['checkMouseCoordinates']({ x: 10, y: 50000 })).toBeFalse();
    });

    it('Loghistory should log history of pencil', () => {
        const spy = spyOn<any>(service['timeline'], 'add').and.callThrough();
        service['tool'] = Tool.Pencil;
        service['activeEvent'] = drawEvent;
        service['path'] = [{ x: 0, y: 0 }];
        service['logHistory']();
        expect(spy).toHaveBeenCalled();
        expect(service['timeline']['history'].at(1)).toBeInstanceOf(PathingTool);

        service['tool'] = Tool.Eraser;
        service['logHistory']();
        expect(spy).toHaveBeenCalled();
        expect(service['timeline']['history'].at(2)).toBeInstanceOf(PathingTool);
    });
    it('global composition should be destination-out if tool==eraser', () => {
        service['tool'] = Tool.Eraser;
        service['prepareCanvas'](drawEvent.drawingContext);
        expect(drawEvent.drawingContext.globalCompositeOperation).toEqual('destination-out');
    });
});
