import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants/constant';
import { DrawEvent } from '@app/interfaces/draw-event';
import { EventHandlerService } from '@app/services/event-handler/event-handler.service';
import { Subject } from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('EventHandlerService', () => {
    let service: EventHandlerService;
    let originalContextStub: CanvasRenderingContext2D;
    let modifiedContextStub: CanvasRenderingContext2D;
    let drawEvent: DrawEvent;
    let mouseEvent: MouseEvent;
    let mockMouseDown: SpyObj<Subject<DrawEvent>>;

    beforeEach(() => {
        mockMouseDown = jasmine.createSpyObj('service.mouseDownObservable', ['next']);
        TestBed.configureTestingModule({
            declarations: [],
            providers: [{ provide: Subject<DrawEvent>, useValue: mockMouseDown }],
        }).compileComponents();
        service = TestBed.inject(EventHandlerService);
        originalContextStub = CanvasTestHelper.createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        modifiedContextStub = CanvasTestHelper.createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        drawEvent = {
            event: {
                type: 'mousedown',
                offsetX: 10,
                offsetY: 20,
                button: 0,
            } as MouseEvent,
            drawingContext: originalContextStub,
            previewContext: modifiedContextStub,
        };
        mouseEvent = {
            type: 'mousedown',
            offsetX: 10,
            offsetY: 20,
            button: 0,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call onMouseDown$.next', () => {
        const spy = spyOn<Subject<DrawEvent>>(service['mouseDown$'], 'next').and.callThrough();
        service.onMouseDown(drawEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('should call onMouseUp$.next', () => {
        const spy = spyOn<Subject<DrawEvent>>(service['mouseUp$'], 'next');
        service.onMouseUp(drawEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('should call mouseClick$.next', () => {
        const spy = spyOn<Subject<MouseEvent>>(service['mouseClick$'], 'next').and.callThrough();
        service.onMouseClick(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('should call mouseMove$.next', () => {
        const spy = spyOn<Subject<DrawEvent>>(service['mouseMove$'], 'next');
        service.onMouseMove(drawEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('should call ctrlZ$.next', () => {
        const spy = spyOn(service['ctrlZ$'], 'next');
        service.onCtrlZ();
        expect(spy).toHaveBeenCalled();
    });

    it('should call ctrlShiftZ$.next', () => {
        const spy = spyOn(service['ctrlShiftZ$'], 'next');
        service.onCtrlShiftZ();
        expect(spy).toHaveBeenCalled();
    });

    it('should call keyDownT$.next', () => {
        const spy = spyOn(service['keyDownT$'], 'next');
        service.onKeyDownT();
        expect(spy).toHaveBeenCalled();
    });

    it('should call keyDownI$.next', () => {
        const spy = spyOn(service['keyDownI$'], 'next');
        service.onKeyDownI();
        expect(spy).toHaveBeenCalled();
    });

    it('should call hintButton$.next', () => {
        const spy = spyOn(service['hintButton$'], 'next');
        service.onHintButton();
        expect(spy).toHaveBeenCalled();
    });
});
