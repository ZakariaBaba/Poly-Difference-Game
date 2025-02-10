import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { HintLevel } from '@app/interfaces/hints';
import { DifferencesService } from '@app/services/differences/differences.service';
import { EventHandlerService } from '@app/services/event-handler/event-handler.service';
import { SoundService } from '@app/services/sound/sound.service';
import { Coordinates } from '@common/interfaces/coordinates';
import { Difference } from '@common/interfaces/difference';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import SpyObj = jasmine.SpyObj;

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let mouseEvent: MouseEvent;
    let differenceServiceSpy: SpyObj<DifferencesService>;
    let soundServiceSpy: SpyObj<SoundService>;
    let foundDifferenceSource: Subject<Difference>;
    let errorDifferenceSource: Subject<boolean>;
    let cheatModeSource: Subject<Difference[]>;
    let gameSwitchSource: Subject<string>;
    let hintSource: Subject<Coordinates>;
    let hintButton: Subject<void>;
    let expectedDifferences: Difference;
    let eventHandlerServiceSpy: SpyObj<EventHandlerService>;
    beforeEach(() => {
        expectedDifferences = {
            pixelsPosition: [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
            ],
        };
        foundDifferenceSource = new Subject<Difference>();
        errorDifferenceSource = new Subject<boolean>();
        cheatModeSource = new Subject<Difference[]>();
        gameSwitchSource = new Subject<string>();
        hintSource = new Subject<Coordinates>();
        hintButton = new Subject<void>();
        differenceServiceSpy = jasmine.createSpyObj('DifferenceService', [
            'validateDifference',
            'drawDifference',
            'drawAllDifferences',
            'makeDifferenceTransparent',
            'unsubscribe',
        ]);
        soundServiceSpy = jasmine.createSpyObj('SoundService', ['playCorrectSound', 'playIncorrectSound']);
        eventHandlerServiceSpy = jasmine.createSpyObj('EventHandlerService', ['onMouseClick', 'onKeyDownT', 'onKeyDownI']);
        differenceServiceSpy.foundDifferenceObservable = foundDifferenceSource.asObservable();
        differenceServiceSpy.errorDifferenceObservable = errorDifferenceSource.asObservable();
        differenceServiceSpy.cheatModeObservable = cheatModeSource.asObservable();
        differenceServiceSpy.gameSwitchObservable = gameSwitchSource.asObservable();
        differenceServiceSpy.hintObservable = hintSource.asObservable();
        eventHandlerServiceSpy.hintButtonObservable = hintButton.asObservable();
        TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
            providers: [
                { provide: DifferencesService, useValue: differenceServiceSpy },
                { provide: SoundService, useValue: soundServiceSpy },
                { provide: EventHandlerService, useValue: eventHandlerServiceSpy },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('subscribeToGameSwitch should', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any, any>(component, 'changeImages');
        component['subscribeToGameSwitch']();
        gameSwitchSource.next('1');
        expect(spy).toHaveBeenCalled();
    });

    it('changeImages should', () => {
        component['changeImages']('1');
        component.activateCheatMode();
        expect(soundServiceSpy.playCorrectSound).toHaveBeenCalled();
        expect(component.originalImage.src).toEqual(environment.serverUrl + '/image/original-image/' + '1');
        expect(component.modifiedImage.src).toEqual(environment.serverUrl + '/image/modified-image/' + '1');
    });

    it('activateCheatmode should activate the onKeyDownT if isCheatmode is false', () => {
        component['isCheatMode'] = false;
        component.activateCheatMode();
        expect(eventHandlerServiceSpy.onKeyDownT).toHaveBeenCalled();
    });

    it('activateCheatmode should clear the cheatCanvas if isCheatMode is true', () => {
        component['isCheatMode'] = true;
        component.activateCheatMode();
        expect(eventHandlerServiceSpy.onKeyDownT).not.toHaveBeenCalled();
        expect(component['isCheatMode']).toBeFalse();
    });

    it('enableInput should set error text to null and pointer events to auto', () => {
        component['enableInput']();

        expect(component['error'].nativeElement.textContent).toBe('');
        expect(component['originalCanvas'].nativeElement.style.pointerEvents).toBe('auto');
        expect(component['modifiedCanvas'].nativeElement.style.pointerEvents).toBe('auto');
    });

    it('onMouseClick should read the mouse pointer position', () => {
        const expectedPosition: Coordinates = { x: 100, y: 200 };
        mouseEvent = {
            offsetX: expectedPosition.x,
            offsetY: expectedPosition.y,
        } as MouseEvent;
        component.onMouseClick(mouseEvent);
        expect(eventHandlerServiceSpy.onMouseClick).toHaveBeenCalledWith(mouseEvent);
    });

    it('finding difference should call playCorrectSound()', () => {
        foundDifferenceSource.next(expectedDifferences);
        expect(soundServiceSpy.playCorrectSound).toHaveBeenCalled();
    });

    it('finding difference should call drawDifference', () => {
        foundDifferenceSource.next(expectedDifferences);
        expect(differenceServiceSpy.drawDifference).toHaveBeenCalled();
    });

    it('finding difference should call makeDifferenceTransparent', () => {
        foundDifferenceSource.next(expectedDifferences);
        expect(differenceServiceSpy.makeDifferenceTransparent).toHaveBeenCalled();
    });

    it('receiving error difference should call playIncorrectSound()', () => {
        errorDifferenceSource.next(true);
        expect(soundServiceSpy.playIncorrectSound).toHaveBeenCalled();
    });

    it('receiving error difference should set error text to erreur', () => {
        errorDifferenceSource.next(true);
        expect(component['error'].nativeElement.textContent).toBe('ERREUR');
    });

    it('receiving coordinates from hint subscription should call drawHints with those coordinates', () => {
        const coordinate: Coordinates = { x: 0, y: 0 };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(component, 'drawHints');
        hintSource.next(coordinate);
        expect(spy).toHaveBeenCalledWith(coordinate);
    });

    it('receiving hintButton  should call getHint', () => {
        const spy = spyOn(component, 'getHint');
        hintButton.next();
        expect(spy).toHaveBeenCalledWith();
    });

    it('get hint should remove one hint and place it in actualHint', () => {
        let lastHint: HintLevel;
        component['canGetHint'] = true;
        while (component.remainingHints.length > 0) {
            lastHint = component.remainingHints[component.remainingHints.length - 1];
            component.getHint();
            expect(component.actualHint).toBe(lastHint);
            expect(component['canGetHint']).toBe(false);
            component.getHint();
            expect(component.actualHint).toBe(lastHint);
            component['canGetHint'] = true;
        }
        expect(eventHandlerServiceSpy.onKeyDownI).toHaveBeenCalled();
    });

    it('drawHints should call usedHintEvent', () => {
        const coordinate: Coordinates = { x: 0, y: 0 };
        component['actualHint'] = HintLevel.First;
        const eventSpy = spyOn(component, 'usedHintEvent');

        hintSource.next(coordinate);

        expect(eventSpy).toHaveBeenCalled();
    });

    it('drawHints should work when actualHint is Last', () => {
        const coordinate: Coordinates = { x: 0, y: 0 };
        component['actualHint'] = HintLevel.Last;
        const eventSpy = spyOn(component, 'usedHintEvent').and.callThrough();

        hintSource.next(coordinate);

        expect(eventSpy).toHaveBeenCalled();
    });

    it('receiving all differences should draw all the differences and put isCheatMode to true', () => {
        const arrayDifferences: Difference[] = [
            {
                pixelsPosition: [
                    { x: 0, y: 0 },
                    { x: 1, y: 1 },
                ],
            },
        ];
        cheatModeSource.next(arrayDifferences);
        expect(differenceServiceSpy.drawAllDifferences).toHaveBeenCalled();
        expect(component['isCheatMode']).toBeTrue();
    });
});
