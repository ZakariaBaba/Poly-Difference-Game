import { HttpEventType, HttpHeaders, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawEvent } from '@app/interfaces/draw-event';
import { PrivateGame } from '@app/interfaces/game';
import { EventHandlerService } from '@app/services/event-handler/event-handler.service';
import { ToolService } from '@app/services/tool/tool.service';
import { Coordinates } from '@common/interfaces/coordinates';
import { Difference } from '@common/interfaces/difference';
import { ConstantParameter } from '@common/interfaces/public-game';
import { Observable, of, Subject } from 'rxjs';
import { GameCreationService } from './game-creation.service';
import SpyObj = jasmine.SpyObj;

describe('GameCreationService', () => {
    let service: GameCreationService;
    let httpMock: HttpTestingController;
    let baseUrl: string;
    let data: PrivateGame;
    let dataConstant: ConstantParameter;
    let toolServiceSpy: SpyObj<ToolService>;
    let eventHandlerServiceSpy: SpyObj<EventHandlerService>;

    let voidObservable: Observable<void>;
    let mouseDrawObservable: Observable<DrawEvent>;

    const voidSubject: Subject<void> = new Subject<void>();
    const mouseDrawSubject: Subject<DrawEvent> = new Subject<DrawEvent>();

    beforeEach(() => {
        voidObservable = voidSubject.asObservable();
        mouseDrawObservable = mouseDrawSubject.asObservable();
        toolServiceSpy = jasmine.createSpyObj('ToolService', [
            'redo',
            'undo',
            'clear',
            'transfer',
            'exchange',
            'onMouseMove',
            'onMouseUp',
            'onMouseDown',
        ]);
        eventHandlerServiceSpy = jasmine.createSpyObj('EventHandlerService', [], {
            ['ctrlZObservable']: of(voidObservable),
            ['ctrlShiftZObservable']: of(voidObservable),
            ['mouseUpObservable']: of(mouseDrawObservable),
            ['mouseDownObservable']: of(mouseDrawObservable),
            ['mouseMoveObservable']: of(mouseDrawObservable),
        });
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: ToolService, useValue: toolServiceSpy },
                { provide: EventHandlerService, useValue: eventHandlerServiceSpy },
            ],
        });
        service = TestBed.inject(GameCreationService);
        httpMock = TestBed.inject(HttpTestingController);
        baseUrl = service['baseUrl'];
        const coordinates: Coordinates = { x: 0, y: 0 };
        const differenceXY: Difference = { pixelsPosition: [coordinates] };
        data = {
            name: 'gameName',
            originalImage: 'originalUrl',
            modifiedImage: 'modifiedUrl',
            numberOfDifference: 12,
            arrayOfDifference: [differenceXY],
        };
        dataConstant = {
            totalTime: 2,
            timeWon: 1,
            penalty: 1,
        };
    });
    afterEach(() => {
        // After every test, assert that there are no more pending requests.
        httpMock.verify();
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('setConstantGame should call post', () => {
        service.setConstantGame(dataConstant).subscribe();
        const req = httpMock.expectOne(`${baseUrl}/game/constant`);
        expect(req.request.method).toBe('POST');
    });

    it('game upload should call post', () => {
        service.gameUpload(data).subscribe();
        const req = httpMock.expectOne(`${baseUrl}/game`);
        expect(req.request.method).toBe('POST');
    });

    it('iSSize should call post', fakeAsync(() => {
        const file = new File([], 'test');
        service['isSize'](file);
        const req = httpMock.expectOne(`${baseUrl}/image`);

        tick();
        expect(req.request.method).toBe('POST');
    }));

    it('negative response should create an alert', async () => {
        const ctx = CanvasTestHelper.createCanvas(1, 1).getContext('2d') as CanvasRenderingContext2D;
        const file = new File([], 'test');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service, 'isSize').and.rejectWith('error');
        const alertSpy = spyOn(window, 'alert');
        await service.loadImage(file, ctx);
        expect(spy).toHaveBeenCalled();
        expect(alertSpy).toHaveBeenCalled();
    });
    it('positive response with status ok should set reader onload', async () => {
        const ctx = CanvasTestHelper.createCanvas(1, 1).getContext('2d') as CanvasRenderingContext2D;
        const file = new File([], 'test');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service, 'isSize').and.resolveTo({
            body: '',
            status: HttpStatusCode.Ok,
            type: HttpEventType.Response,
            ok: true,
            url: '',
            statusText: '',
            headers: new HttpHeaders(),
            clone: () => {
                return new HttpResponse<string>();
            },
        });
        expect(service['reader'].onload).toBeNull();

        await service.loadImage(file, ctx);
        expect(spy).toHaveBeenCalled();

        expect(service['reader'].onload).not.toBeNull();
    });
    it('positive response without status ok should not set reader onload', async () => {
        const ctx = CanvasTestHelper.createCanvas(1, 1).getContext('2d') as CanvasRenderingContext2D;
        const file = new File([], 'test');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service, 'isSize').and.resolveTo({
            body: '',
            status: HttpStatusCode.ImATeapot,
            type: HttpEventType.Response,
            ok: true,
            url: '',
            statusText: '',
            headers: new HttpHeaders(),
            clone: () => {
                return new HttpResponse<string>();
            },
        });

        await service.loadImage(file, ctx);
        expect(spy).toHaveBeenCalled();

        expect(service['reader'].onload).toBeNull();
    });

    it('onClear should call toolService clear', () => {
        const ctx = CanvasTestHelper.createCanvas(1, 1).getContext('2d') as CanvasRenderingContext2D;
        service.onClear(ctx);
        expect(toolServiceSpy.clear).toHaveBeenCalled();
        expect(toolServiceSpy.clear).toHaveBeenCalledOnceWith(ctx);
    });
    it('onClear should call toolService clear twice with 2 canvas ', () => {
        const ctx = CanvasTestHelper.createCanvas(1, 1).getContext('2d') as CanvasRenderingContext2D;
        const ctx2 = CanvasTestHelper.createCanvas(1, 1).getContext('2d') as CanvasRenderingContext2D;
        service.onClear(ctx, ctx2);
        expect(toolServiceSpy.clear).toHaveBeenCalled();
        expect(toolServiceSpy.clear).toHaveBeenCalledWith(ctx);
        expect(toolServiceSpy.clear).toHaveBeenCalledWith(ctx2);
    });
    it('onTransfer should call toolService transfer', () => {
        const ctx = CanvasTestHelper.createCanvas(1, 1).getContext('2d') as CanvasRenderingContext2D;
        const ctx2 = CanvasTestHelper.createCanvas(1, 1).getContext('2d') as CanvasRenderingContext2D;
        service.onTransfer(ctx, ctx2);
        expect(toolServiceSpy.transfer).toHaveBeenCalled();
    });
    it('onExchange should call toolService exchange', () => {
        const ctx = CanvasTestHelper.createCanvas(1, 1).getContext('2d') as CanvasRenderingContext2D;
        const ctx2 = CanvasTestHelper.createCanvas(1, 1).getContext('2d') as CanvasRenderingContext2D;
        service.onExchange(ctx, ctx2);
        expect(toolServiceSpy.exchange).toHaveBeenCalled();
    });

    it('subscribe should add subscriptions', () => {
        expect(service['mouseDownSubscription']).not.toBeDefined();
        expect(service['ctrlShiftZSubscription']).not.toBeDefined();
        service.subscribeToUserInput();
        expect(service['mouseDownSubscription']).toBeDefined();
        expect(service['ctrlShiftZSubscription']).toBeDefined();
    });
    it('unsubscribe should remove subscriptions', () => {
        service.subscribeToUserInput();
        const mouseDownSpy = spyOn(service['mouseDownSubscription'], 'unsubscribe');
        const ctrlShiftZSpy = spyOn(service['ctrlShiftZSubscription'], 'unsubscribe');
        service.unsubscribeToUserInput();
        expect(mouseDownSpy).toHaveBeenCalled();
        expect(ctrlShiftZSpy).toHaveBeenCalled();
    });
    it('receiving a drawEvent on eventHandler should call toolService onMouseDown, onMouseMove and onMouseUp', () => {
        service.subscribeToUserInput();
        const ctx = CanvasTestHelper.createCanvas(1, 1).getContext('2d') as CanvasRenderingContext2D;
        const ctx2 = CanvasTestHelper.createCanvas(1, 1).getContext('2d') as CanvasRenderingContext2D;
        const mouseEvent = {
            offsetX: 0,
            offsetY: 0,
        } as MouseEvent;
        const event: DrawEvent = { event: mouseEvent, drawingContext: ctx, previewContext: ctx2 };
        mouseDrawSubject.next(event);
        expect(toolServiceSpy.onMouseUp).toHaveBeenCalled();
        expect(toolServiceSpy.onMouseDown).toHaveBeenCalled();
        expect(toolServiceSpy.onMouseDown).toHaveBeenCalled();
    });
});
