import { Injectable } from '@angular/core';
import { ONE_SECOND_IN_MS } from '@app/constants/constant';
import { EventHandlerService } from '@app/services/event-handler/event-handler.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { DifferencesEvents } from '@common/events/differences.events';
import { GameEvents } from '@common/events/game.events';
import { Coordinates } from '@common/interfaces/coordinates';
import { Difference } from '@common/interfaces/difference';
import { DifferencesCount } from '@common/interfaces/differences-count';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DifferencesService {
    foundDifferenceObservable: Observable<Difference>;
    errorDifferenceObservable: Observable<boolean>;
    differenceCountObservable: Observable<DifferencesCount>;
    cheatModeObservable: Observable<Difference[]>;
    gameSwitchObservable: Observable<string>;
    hintObservable: Observable<Coordinates>;

    private foundDifference$: Subject<Difference> = new Subject<Difference>();
    private errorDifference$: Subject<boolean> = new Subject<boolean>();
    private differenceCount$: BehaviorSubject<DifferencesCount> = new BehaviorSubject<DifferencesCount>({ total: 0, host: 0, guest: 0 });
    private cheatMode$: Subject<Difference[]> = new Subject<Difference[]>();
    private gameSwitch$: Subject<string> = new Subject<string>();
    private hint$: Subject<Coordinates> = new Subject<Coordinates>();

    private mouseClickSubscription: Subscription;
    private keyDownT: Subscription;
    private keyDownI: Subscription;
    constructor(private socketClientService: SocketClientService, private eventHandlerService: EventHandlerService) {
        this.foundDifferenceObservable = this.foundDifference$.asObservable();
        this.errorDifferenceObservable = this.errorDifference$.asObservable();
        this.differenceCountObservable = this.differenceCount$.asObservable();
        this.cheatModeObservable = this.cheatMode$.asObservable();
        this.gameSwitchObservable = this.gameSwitch$.asObservable();
        this.hintObservable = this.hint$.asObservable();
    }

    listenDifferenceEvents(): void {
        this.socketClientService.on(DifferencesEvents.DifferenceCount, (differenceCount: DifferencesCount) => {
            this.differenceCount$.next(differenceCount);
        });

        this.socketClientService.on(DifferencesEvents.DifferenceFound, (difference: Difference) => {
            this.foundDifference$.next(difference);
        });

        this.socketClientService.on(DifferencesEvents.ErrorDifference, () => {
            this.errorDifference$.next(true);
        });

        this.mouseClickSubscription = this.eventHandlerService.mouseClickObservable.subscribe((mouseEvent: MouseEvent) => {
            this.validateDifference({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
        });

        this.keyDownT = this.eventHandlerService.keyDownTObservable.subscribe(() => {
            this.socketClientService.send(DifferencesEvents.AllDifferences);
        });

        this.keyDownI = this.eventHandlerService.keyDownIObservable.subscribe(() => {
            this.socketClientService.send(DifferencesEvents.RequestHint);
        });

        this.socketClientService.on(DifferencesEvents.AllDifferences, (difference: Difference[]) => {
            this.cheatMode$.next(difference);
        });

        this.socketClientService.on(GameEvents.GameSwitch, (gameId: string) => {
            this.gameSwitch$.next(gameId);
        });
        this.socketClientService.on(DifferencesEvents.ReturnHint, (position: Coordinates) => {
            this.hint$.next(position);
        });
    }

    drawDifference(difference: Difference, differenceContext: CanvasRenderingContext2D): void {
        difference.pixelsPosition.forEach((pixelCoordinates: Coordinates) => {
            differenceContext.fillStyle = 'red';
            differenceContext.fillRect(pixelCoordinates.x, pixelCoordinates.y, 1, 1);
        });

        setTimeout(() => differenceContext.clearRect(0, 0, differenceContext.canvas.width, differenceContext.canvas.height), ONE_SECOND_IN_MS);
    }

    drawAllDifferences(differences: Difference[], differenceContext: CanvasRenderingContext2D): void {
        differences.forEach((difference: Difference) => {
            difference.pixelsPosition.forEach((pixelCoordinates: Coordinates) => {
                differenceContext.fillStyle = 'red';
                differenceContext.fillRect(pixelCoordinates.x, pixelCoordinates.y, 1, 1);
            });
        });
    }

    makeDifferenceTransparent(difference: Difference, canvas: CanvasRenderingContext2D[]): void {
        setTimeout(() => {
            difference.pixelsPosition.forEach((pixelCoordinates: Coordinates) => {
                canvas.forEach((context: CanvasRenderingContext2D) => {
                    context.clearRect(pixelCoordinates.x, pixelCoordinates.y, 1, 1);
                });
            });
        }, ONE_SECOND_IN_MS);
    }
    unsubscribe(): void {
        this.mouseClickSubscription.unsubscribe();
        this.keyDownT.unsubscribe();
        this.keyDownI.unsubscribe();
    }

    private validateDifference(coordinates: Coordinates): void {
        this.socketClientService.send(DifferencesEvents.Validate, coordinates);
    }
}
