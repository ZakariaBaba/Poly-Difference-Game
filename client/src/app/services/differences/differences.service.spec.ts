import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { IMAGE_HEIGHT, IMAGE_WIDTH, ONE_SECOND_IN_MS } from '@app/constants/constant';
import { DifferencesService } from '@app/services/differences/differences.service';
import { EventHandlerService } from '@app/services/event-handler/event-handler.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { DifferencesEvents } from '@common/events/differences.events';
import { GameEvents } from '@common/events/game.events';
import { Coordinates } from '@common/interfaces/coordinates';
import { Difference } from '@common/interfaces/difference';
import { DifferencesCount } from '@common/interfaces/differences-count';
import { BehaviorSubject, Subject } from 'rxjs';
import { Socket } from 'socket.io-client';

const EXPECTED_DIFFERENCE_COUNT = 4;

describe('DifferencesService', () => {
    let service: DifferencesService;
    let socketServiceMock: SocketClientService;
    let socketHelper: SocketTestHelper;
    let expectedDifferences: Difference;
    let differenceContext: CanvasRenderingContext2D;
    let coordinates: Coordinates;
    let eventHandlerServiceSpy: jasmine.SpyObj<EventHandlerService>;
    let mouseClickSource: Subject<MouseEvent>;
    let keyDownTSource: Subject<void>;
    let keyDownISource: Subject<void>;

    beforeEach(() => {
        mouseClickSource = new Subject<MouseEvent>();
        keyDownTSource = new Subject<void>();
        keyDownISource = new Subject<void>();
        eventHandlerServiceSpy = jasmine.createSpyObj('EventHandlerService', ['onKeyDownT']);

        expectedDifferences = {
            pixelsPosition: [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
            ],
        };
        eventHandlerServiceSpy.mouseClickObservable = mouseClickSource.asObservable();
        eventHandlerServiceSpy.keyDownTObservable = keyDownTSource.asObservable();
        eventHandlerServiceSpy.keyDownIObservable = keyDownISource.asObservable();
        coordinates = { x: 0, y: 0 };
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientService();
        socketServiceMock.socket = socketHelper as unknown as Socket;
        TestBed.configureTestingModule({
            providers: [
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: EventHandlerService, useValue: eventHandlerServiceSpy },
            ],
        });
        service = TestBed.inject(DifferencesService);
        differenceContext = CanvasTestHelper.createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        const modifiedImage: HTMLImageElement = new Image();
        modifiedImage.onload = () => {
            differenceContext.drawImage(modifiedImage, 0, 0);
        };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('mouseClick should call validateDifference', () => {
        const expectedPosition: Coordinates = { x: 100, y: 200 };
        const mouseEvent = {
            offsetX: expectedPosition.x,
            offsetY: expectedPosition.y,
        } as MouseEvent;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any, any>(service, 'validateDifference');
        service.listenDifferenceEvents();
        mouseClickSource.next(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('keydownT should send a socket event', () => {
        const sendSpy = spyOn(service['socketClientService'], 'send').and.callThrough();
        service.listenDifferenceEvents();
        keyDownTSource.next();
        expect(sendSpy).toHaveBeenCalled();
    });

    it('keydownI should send a socket event', () => {
        const sendSpy = spyOn(service['socketClientService'], 'send').and.callThrough();
        service.listenDifferenceEvents();
        keyDownISource.next();
        expect(sendSpy).toHaveBeenCalled();
    });

    it('ReturnHint event should call next', () => {
        const expectedPosition: Coordinates = { x: 100, y: 200 };
        service.listenDifferenceEvents();
        const hintSpy = spyOn<Subject<Coordinates>>(service['hint$'], 'next').and.callThrough();
        socketHelper.peerSideEmit(DifferencesEvents.ReturnHint, expectedPosition);
        expect(hintSpy).toHaveBeenCalledWith(expectedPosition);
    });

    it('gameSwitch event', () => {
        service.listenDifferenceEvents();
        const gameSwitchSpy = spyOn<Subject<string>>(service['gameSwitch$'], 'next').and.callThrough();
        socketHelper.peerSideEmit(GameEvents.GameSwitch, 'gameId');
        expect(gameSwitchSpy).toHaveBeenCalledWith('gameId');
    });

    it('found difference event should update difference source', () => {
        service.listenDifferenceEvents();
        const foundDifferenceSpy = spyOn<Subject<Difference>>(service['foundDifference$'], 'next').and.callThrough();
        socketHelper.peerSideEmit(DifferencesEvents.DifferenceFound, expectedDifferences);
        expect(foundDifferenceSpy).toHaveBeenCalledWith(expectedDifferences);
    });

    it('error difference event should error difference source', () => {
        service.listenDifferenceEvents();
        const errorDifferenceSpy = spyOn<Subject<boolean>>(service['errorDifference$'], 'next').and.callThrough();
        socketHelper.peerSideEmit(DifferencesEvents.ErrorDifference, true);
        expect(errorDifferenceSpy).toHaveBeenCalledWith(true);
    });

    it('count difference event should count difference source', () => {
        service.listenDifferenceEvents();
        const countDifferenceSpy = spyOn<BehaviorSubject<DifferencesCount>>(service['differenceCount$'], 'next').and.callThrough();
        socketHelper.peerSideEmit(DifferencesEvents.DifferenceCount, EXPECTED_DIFFERENCE_COUNT);
        expect(countDifferenceSpy).toHaveBeenCalledWith(EXPECTED_DIFFERENCE_COUNT);
    });

    it('onkeyDownT should send socket event to DifferencesEvents.AllDifference', () => {
        const arrayDifferences: Difference[] = [
            {
                pixelsPosition: [
                    { x: 0, y: 0 },
                    { x: 1, y: 1 },
                ],
            },
        ];
        service.listenDifferenceEvents();
        const cheatModeSpy = spyOn<Subject<Difference[]>>(service['cheatMode$'], 'next').and.callThrough();
        socketHelper.peerSideEmit(DifferencesEvents.AllDifferences, arrayDifferences);
        expect(cheatModeSpy).toHaveBeenCalledWith(arrayDifferences);
    });
    it('drawDifference should draw the difference on a canvas and erase it after a second', () => {
        const imageData = differenceContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        const deepCopyDataUnchanged = [...imageData.data];
        service.drawDifference(expectedDifferences, differenceContext);
        const imageDataModified = differenceContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        const dataChanged = [...imageDataModified.data];
        expect(deepCopyDataUnchanged).not.toEqual(dataChanged);
    });

    it('drawDifference should erase the difference drawn after a second', () => {
        const imageData = differenceContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        const deepCopyDataUnchanged = [...imageData.data];
        jasmine.clock().install();
        service.drawDifference(expectedDifferences, differenceContext);
        const imageDataModified = differenceContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        const dataChanged = [...imageDataModified.data];
        expect(deepCopyDataUnchanged).not.toEqual(dataChanged);
        jasmine.clock().tick(ONE_SECOND_IN_MS);
        const imageDataAfterClearRect = differenceContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        const dataAfterClearRect = [...imageDataAfterClearRect.data];
        expect(deepCopyDataUnchanged).toEqual(dataAfterClearRect);
        jasmine.clock().uninstall();
    });

    it('makeDifferenceTransparent should clear the difference with clearRect on the canvas', () => {
        differenceContext.fillRect(0, 1, IMAGE_WIDTH, IMAGE_HEIGHT);
        const imageData = differenceContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        const deepCopyDataUnchanged = [...imageData.data];
        service.makeDifferenceTransparent(expectedDifferences, [differenceContext, differenceContext, differenceContext]);
        const imageDataModified = differenceContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        const dataChanged = [...imageDataModified.data];
        expect(deepCopyDataUnchanged).toEqual(dataChanged);
    });

    it('drawAllDifference should draw the Alldifference on a canvas and erase it after a second', () => {
        const imageData = differenceContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        const deepCopyDataUnchanged = [...imageData.data];
        service.drawAllDifferences([expectedDifferences], differenceContext);
        const imageDataModified = differenceContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        const dataChanged = [...imageDataModified.data];
        expect(deepCopyDataUnchanged).not.toEqual(dataChanged);
    });

    it('validateDifference should send a socket when a difference is found', () => {
        const validateDifferenceSpy = spyOn(service['socketClientService'], 'send').and.callThrough();
        socketHelper.peerSideEmit(DifferencesEvents.Validate, EXPECTED_DIFFERENCE_COUNT);
        service['validateDifference'](coordinates);
        expect(validateDifferenceSpy).toHaveBeenCalled();
    });

    it('unsubscribe should call unsubscribe after a mouseClick', () => {
        service.listenDifferenceEvents();
        const spy = spyOn(service['mouseClickSubscription'], 'unsubscribe');
        service.unsubscribe();
        expect(spy).toHaveBeenCalled();
    });
});
