import { Injectable } from '@angular/core';
import { DrawEvent } from '@app/interfaces/draw-event';
import { Observable, Subject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class EventHandlerService {
    mouseDownObservable: Observable<DrawEvent>;
    mouseClickObservable: Observable<MouseEvent>;
    mouseMoveObservable: Observable<DrawEvent>;
    mouseUpObservable: Observable<DrawEvent>;
    ctrlZObservable: Observable<void>;
    ctrlShiftZObservable: Observable<void>;
    keyDownTObservable: Observable<void>;
    keyDownIObservable: Observable<void>;
    hintButtonObservable: Observable<void>;

    private mouseDown$: Subject<DrawEvent> = new Subject<DrawEvent>();
    private mouseClick$: Subject<MouseEvent> = new Subject<MouseEvent>();
    private mouseMove$: Subject<DrawEvent> = new Subject<DrawEvent>();
    private mouseUp$: Subject<DrawEvent> = new Subject<DrawEvent>();
    private ctrlZ$: Subject<void> = new Subject<void>();
    private ctrlShiftZ$: Subject<void> = new Subject<void>();
    private keyDownT$: Subject<void> = new Subject<void>();
    private keyDownI$: Subject<void> = new Subject<void>();
    private hintButton$: Subject<void> = new Subject<void>();

    constructor() {
        this.mouseDownObservable = this.mouseDown$.asObservable();
        this.mouseClickObservable = this.mouseClick$.asObservable();
        this.mouseMoveObservable = this.mouseMove$.asObservable();
        this.mouseUpObservable = this.mouseUp$.asObservable();
        this.ctrlZObservable = this.ctrlZ$.asObservable();
        this.ctrlShiftZObservable = this.ctrlShiftZ$.asObservable();
        this.keyDownTObservable = this.keyDownT$.asObservable();
        this.keyDownIObservable = this.keyDownI$.asObservable();
        this.hintButtonObservable = this.hintButton$.asObservable();
    }

    onMouseDown(mouseEvent: DrawEvent): void {
        this.mouseDown$.next(mouseEvent);
    }

    onMouseClick(mouseEvent: MouseEvent): void {
        this.mouseClick$.next(mouseEvent);
    }

    onMouseMove(mouseEvent: DrawEvent): void {
        this.mouseMove$.next(mouseEvent);
    }

    onMouseUp(mouseEvent: DrawEvent): void {
        this.mouseUp$.next(mouseEvent);
    }
    onCtrlZ(): void {
        this.ctrlZ$.next();
    }
    onCtrlShiftZ(): void {
        this.ctrlShiftZ$.next();
    }
    onKeyDownT(): void {
        this.keyDownT$.next();
    }
    onKeyDownI(): void {
        this.keyDownI$.next();
    }
    onHintButton(): void {
        this.hintButton$.next();
    }
}
