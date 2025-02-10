/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants/constant';
import { DifferenceGenerationService } from '@app/services/differences/difference-generation.service';
import { EventHandlerService } from '@app/services/event-handler/event-handler.service';
import { GameCreationService } from '@app/services/game-creation/game-creation.service';
import { of } from 'rxjs';
import { ZoneEditComponent } from './zone-edit.component';

import SpyObj = jasmine.SpyObj;
class MatDialogMock {
    open() {
        return {
            afterClosed: () => of({}),
        };
    }
}

describe('ZoneEditComponent', () => {
    let component: ZoneEditComponent;
    let fixture: ComponentFixture<ZoneEditComponent>;
    let mockGameServiceSpyObj: SpyObj<GameCreationService>;
    let differenceServiceSpy: SpyObj<DifferenceGenerationService>;
    let eventHandlerServiceSpy: SpyObj<EventHandlerService>;
    let baseContextStub: CanvasRenderingContext2D;
    let originalContextStub: CanvasRenderingContext2D;
    let modifiedContextStub: CanvasRenderingContext2D;
    let drawinngContextStub: CanvasRenderingContext2D;
    beforeEach(async () => {
        eventHandlerServiceSpy = jasmine.createSpyObj('EventHandlerService', ['onMouseDown', 'onMouseMove', 'onMouseUp', 'onCtrlZ', 'onCtrlShiftZ']);

        mockGameServiceSpyObj = jasmine.createSpyObj('GameCreationService', [
            'loadImage',
            'gameUpload',
            'subscribeToUserInput',
            'unsubscribeToUserInput',
            'onClear',
            'onExchange',
            'onTransfer',
        ]);

        differenceServiceSpy = jasmine.createSpyObj('DifferenceGestionService', [
            'generateNewData',
            'getDifferenceAmount',
            'getDifferencesCoordinates',
            'getDifferenceImage',
        ]);

        await TestBed.configureTestingModule({
            declarations: [ZoneEditComponent],
            providers: [
                { provide: GameCreationService, useValue: mockGameServiceSpyObj },
                { provide: DifferenceGenerationService, useValue: differenceServiceSpy },
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: EventHandlerService, useValue: eventHandlerServiceSpy },
            ],
            imports: [MatDialogModule, MatIconModule, MatDividerModule, MatTooltipModule],
        }).compileComponents();

        fixture = TestBed.createComponent(ZoneEditComponent);

        fixture.detectChanges();
        component = fixture.componentInstance;
        baseContextStub = CanvasTestHelper.createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        originalContextStub = CanvasTestHelper.createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        modifiedContextStub = CanvasTestHelper.createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        drawinngContextStub = CanvasTestHelper.createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        mockGameServiceSpyObj.gameUpload.and.returnValue(of(true));
    });
    afterEach(() => {
        fixture.destroy();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('onMouseUp should call the evenHandlerService', () => {
        const mouseEvent = {
            offsetX: 50,
            offsetY: 200,
        } as MouseEvent;
        component.onMouseUp(mouseEvent, drawinngContextStub, baseContextStub);
        expect(eventHandlerServiceSpy.onMouseUp).toHaveBeenCalled();
    });
    it('onMouseDown should call the evenHandlerService', () => {
        const mouseEvent = {
            offsetX: 50,
            offsetY: 200,
        } as MouseEvent;
        component['originalDrawingContext'] = drawinngContextStub;
        component.onMouseDown(mouseEvent, drawinngContextStub, baseContextStub);
        expect(eventHandlerServiceSpy.onMouseDown).toHaveBeenCalled();
    });
    it('onMouseDown should call the evenHandlerService', () => {
        const mouseEvent = {
            offsetX: 50,
            offsetY: 200,
        } as MouseEvent;
        component['modifiedDrawingContext'] = drawinngContextStub;
        component.onMouseDown(mouseEvent, drawinngContextStub, baseContextStub);
        expect(eventHandlerServiceSpy.onMouseDown).toHaveBeenCalled();
    });

    it('onMouseMove should call the evenHandlerService when callbacks is set', () => {
        const mouseEvent = {
            offsetX: 50,
            offsetY: 200,
        } as MouseEvent;

        component.onMouseMove(mouseEvent, drawinngContextStub, baseContextStub);

        expect(eventHandlerServiceSpy.onMouseMove).toHaveBeenCalled();
    });

    it('onCtrlz should call the evenHandlerService', () => {
        component.ctrlZ();
        expect(eventHandlerServiceSpy.onCtrlZ).toHaveBeenCalled();
        expect(component.differenceNumber).toEqual(0);
    });

    it('onShiftCtrlz should call the evenHandlerService', () => {
        component.ctrlShiftZ();
        expect(eventHandlerServiceSpy.onCtrlShiftZ).toHaveBeenCalled();
        expect(component.differenceNumber).toEqual(0);
    });

    it('loadImage should have been called', () => {
        const mockEvent = fixture.debugElement.query(By.css('input[type=file]'));
        const mockInput = mockEvent.nativeElement.dispatchEvent(new InputEvent('change'));
        component.loadImage(mockInput, baseContextStub, originalContextStub);
        expect(mockGameServiceSpyObj.loadImage).toHaveBeenCalled();
    });

    it('loadImage should set modified ', () => {
        const mockEvent = fixture.debugElement.query(By.css('input[type=file]'));
        const mockInput = mockEvent.nativeElement.dispatchEvent(new InputEvent('change'));
        component['modifiedContext'] = modifiedContextStub;
        baseContextStub.fillStyle = 'blue';
        originalContextStub.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        component['modifiedContext'] = originalContextStub;
        component.loadImage(mockInput, baseContextStub, originalContextStub);
        expect(mockGameServiceSpyObj.loadImage).toHaveBeenCalled();
    });

    it('clearbackground', () => {
        baseContextStub.fillStyle = 'blue';
        modifiedContextStub.fillStyle = 'blue';
        originalContextStub.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        component.clearBackground(originalContextStub);
        expect(originalContextStub).toEqual(baseContextStub);
    });

    it('clearCanvas', () => {
        baseContextStub.fillStyle = 'blue';
        modifiedContextStub.fillStyle = 'blue';
        originalContextStub.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        modifiedContextStub.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        component.clearCanvas(originalContextStub);
        expect(modifiedContextStub).toEqual(baseContextStub);
        expect(originalContextStub).toEqual(baseContextStub);
    });

    it('clearCanvas should set hasSetCanvasOriginal to false ', () => {
        component['originalContext'] = originalContextStub;
        component.clearCanvas(originalContextStub);
        expect(component.hasSetCanvasOriginal).toBeFalse();
    });

    it('clearCanvas should set hasSetCanvasModified to false ', () => {
        component['modifiedContext'] = modifiedContextStub;
        baseContextStub.fillStyle = 'blue';
        originalContextStub.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        component['modifiedContext'] = originalContextStub;
        component.clearCanvas(originalContextStub);
        expect(component.hasSetCanvasOriginal).toBeFalse();
    });

    it('openSaveGameDialog should call fileUpload and it should be a succes', () => {
        component.openSaveGameDialog();
        expect(mockGameServiceSpyObj.gameUpload).toHaveBeenCalled();
    });

    it('openSaveGameDialog should return false if there is a problem with the upload', () => {
        mockGameServiceSpyObj.gameUpload.and.returnValue(of(false));
        component.openSaveGameDialog();
        expect(mockGameServiceSpyObj.gameUpload).toHaveBeenCalled();
    });

    it('showDifference should call generateDifferenceData and getDifferenceAmount ', () => {
        component.selectedRadius = 5;
        component['modifiedContext'] = modifiedContextStub;
        component['originalContext'] = originalContextStub;
        component.hasSetCanvasModified = true;
        component.hasSetCanvasOriginal = true;
        component.showDifference();
        expect(differenceServiceSpy.generateNewData).toHaveBeenCalled();
        expect(differenceServiceSpy.getDifferenceAmount).toHaveBeenCalled();
        expect(differenceServiceSpy.getDifferenceImage).toHaveBeenCalled();
    });

    it('showDifference should work with background canvas not set', () => {
        component.selectedRadius = 5;
        component['modifiedDrawingContext'] = modifiedContextStub;
        component['originalDrawingContext'] = originalContextStub;
        component.showDifference();
        expect(differenceServiceSpy.generateNewData).toHaveBeenCalled();
        expect(differenceServiceSpy.getDifferenceAmount).toHaveBeenCalled();
        expect(differenceServiceSpy.getDifferenceImage).toHaveBeenCalled();
    });

    it('setRadius should set the radius correctly', () => {
        component.setRadius(15);
        expect(component.selectedRadius).toEqual(15);
        component.hasSetCanvasOriginal = true;
        component.setRadius(15);
        expect(component.canGetDifferences).toBeTrue();
    });

    it('switchBothDrawingContext should call on exhange', () => {
        component.switchBothDrawingContext(drawinngContextStub, baseContextStub);
        expect(mockGameServiceSpyObj.onExchange).toHaveBeenCalled();
        expect(component.differenceNumber).toEqual(0);

        component.switchDrawingContext(drawinngContextStub, baseContextStub);
        expect(mockGameServiceSpyObj.onTransfer).toHaveBeenCalled();
        expect(component.differenceNumber).toEqual(0);
    });

    it('setDrawCanvasFlags should set originalDrawingContext and modifiedDrawingContext', () => {
        component['originalDrawingContext'] = drawinngContextStub;
        component['setDrawCanvasFlags'](drawinngContextStub, true);
        expect(component['hasDrawnCanvasOriginal']).toBeTrue();

        component['modifiedDrawingContext'] = drawinngContextStub;
        component['setDrawCanvasFlags'](drawinngContextStub, true);
        expect(component['hasDrawnCanvasModified']).toBeTrue();
    });
});
