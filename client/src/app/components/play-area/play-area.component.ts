import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { EYE_MARGIN, EYE_RADIUS, IMAGE_HEIGHT, IMAGE_WIDTH, ONE_SECOND_IN_MS, PUPIL_RADIUS } from '@app/constants/constant';
import { HintLevel } from '@app/interfaces/hints';
import { DifferencesService } from '@app/services/differences/differences.service';
import { EventHandlerService } from '@app/services/event-handler/event-handler.service';
import { SoundService } from '@app/services/sound/sound.service';
import { Coordinates } from '@common/interfaces/coordinates';
import { Difference } from '@common/interfaces/difference';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit, OnInit, OnDestroy {
    @Input() originalImageURL: string;
    @Input() modifiedImageURL: string;
    @Input() canGetHint: boolean;
    @Output() usedHint = new EventEmitter<number>();

    @ViewChild('originalCanvas', { static: false }) private originalCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('endCanvas', { static: false }) private endCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('modifiedCanvas', { static: false }) private modifiedCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('differenceCanvas', { static: false }) private differenceCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('cheatOriginalCanvas', { static: false }) private cheatOriginalCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('cheatModifiedCanvas', { static: false }) private cheatModifiedCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('hintOriginalCanvas', { static: false }) private hintOriginalCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('hintModifiedCanvas', { static: false }) private hintModifiedCanvas!: ElementRef<HTMLCanvasElement>;

    @ViewChild('error', { read: ElementRef }) private error: ElementRef;

    clickCoordinate: Coordinates;
    originalImageSource: string;
    modifiedImageSource: string;
    width: number = IMAGE_WIDTH;
    height: number = IMAGE_HEIGHT;
    context: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    originalImage: HTMLImageElement = new Image();
    modifiedImage: HTMLImageElement = new Image();

    originalContext: CanvasRenderingContext2D;
    modifiedContext: CanvasRenderingContext2D;
    differenceContext: CanvasRenderingContext2D;
    endContext: CanvasRenderingContext2D;
    cheatOriginalContext: CanvasRenderingContext2D;
    cheatModifiedContext: CanvasRenderingContext2D;

    remainingHints: HintLevel[];
    actualHint: HintLevel | undefined;
    hintOriginalContext: CanvasRenderingContext2D;
    hintModifiedContext: CanvasRenderingContext2D;

    mouseAbsolutePositionX: number;
    mouseAbsolutePositionY: number;
    isCheatMode: boolean = false;

    foundDifferenceSubscription: Subscription;
    errorDifferenceSubscription: Subscription;
    cheatModeSubscription: Subscription;
    hintButtonSubscription: Subscription;
    hintSubscription: Subscription;
    gameSwitchSubscription: Subscription;

    constructor(
        private differencesService: DifferencesService,
        private soundService: SoundService,
        private eventHandlerService: EventHandlerService,
    ) {}
    @HostListener('document:keydown.t')
    activateCheatMode(): void {
        if (this.isCheatMode) {
            this.isCheatMode = false;
            this.cheatModifiedContext.clearRect(0, 0, this.width, this.height);
            this.cheatOriginalContext.clearRect(0, 0, this.width, this.height);
        } else {
            this.eventHandlerService.onKeyDownT();
        }
    }
    @HostListener('document:keydown.i')
    getHint(): void {
        if (this.canGetHint) {
            this.canGetHint = false;
            this.actualHint = this.remainingHints.pop();
            this.eventHandlerService.onKeyDownI();
        }
    }
    ngOnInit(): void {
        this.subscribeFoundDifferenceEvent();
        this.subscribeErrorDifference();
        this.subscribeToCheatMode();
        this.subscribeHint();
        this.subscribeHintButton();
        this.subscribeToGameSwitch();
        this.remainingHints = [HintLevel.Last, HintLevel.Second, HintLevel.First];
    }

    ngAfterViewInit(): void {
        this.originalImage.src = this.originalImageURL;
        this.modifiedImage.src = this.modifiedImageURL;
        this.getCanvasContext();
        this.drawImages();
    }

    ngOnDestroy(): void {
        this.foundDifferenceSubscription.unsubscribe();
        this.errorDifferenceSubscription.unsubscribe();
        this.cheatModeSubscription.unsubscribe();
        this.differencesService.unsubscribe();
        this.hintButtonSubscription.unsubscribe();
        this.hintSubscription.unsubscribe();
        this.gameSwitchSubscription.unsubscribe();
    }

    onMouseClick(event: MouseEvent): void {
        this.mouseAbsolutePositionX = event.pageX;
        this.mouseAbsolutePositionY = event.pageY;
        this.eventHandlerService.onMouseClick(event);
    }
    usedHintEvent() {
        this.usedHint.emit(this.remainingHints.length);
    }

    private drawHints(position: Coordinates) {
        if (this.actualHint) {
            if (this.actualHint === HintLevel.Last) {
                const x = this.getRandomInt(EYE_MARGIN, IMAGE_WIDTH - EYE_MARGIN);
                const y = this.getRandomInt(EYE_MARGIN, IMAGE_HEIGHT - EYE_MARGIN);
                this.drawEyes({ x, y }, position, [this.hintOriginalContext, this.hintModifiedContext]);
            } else if (this.actualHint === HintLevel.First || this.actualHint === HintLevel.Second) {
                this.drawHint(this.actualHint, this.hintModifiedContext, position);
                this.drawHint(this.actualHint, this.hintOriginalContext, position);
                this.actualHint = undefined;
            }
            setTimeout(() => {
                this.hintModifiedContext.clearRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
                this.hintOriginalContext.clearRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);

                this.canGetHint = this.remainingHints.length > 0;
                this.actualHint = undefined;
            }, 2 * ONE_SECOND_IN_MS);
            this.usedHintEvent();
        }
    }

    private drawEyes(position: Coordinates, target: Coordinates, ctx: CanvasRenderingContext2D[]) {
        const DISTANCE = EYE_MARGIN;
        const ONE_HUNDRED = 100;
        const theta = this.getRandomInt(-ONE_HUNDRED, ONE_HUNDRED) / ONE_HUNDRED;
        this.drawEye(position, target, ctx);
        this.drawEye(
            {
                x:
                    position.x + DISTANCE * Math.cos(Math.PI * theta) > DISTANCE
                        ? position.x + DISTANCE * Math.cos(Math.PI * theta)
                        : position.x - DISTANCE * Math.cos(Math.PI * theta),
                y:
                    position.y + DISTANCE * Math.sin(Math.PI * theta) > DISTANCE
                        ? position.y + DISTANCE * Math.sin(Math.PI * theta)
                        : position.y - DISTANCE * Math.sin(Math.PI * theta),
            },
            target,
            ctx,
        );
    }
    private drawEye(position: Coordinates, target: Coordinates, ctx: CanvasRenderingContext2D[]) {
        const vector = { x: position.x - target.x, y: position.y - target.y };
        const module = Math.sqrt(vector.x ** 2 + vector.y ** 2);
        const directionnal = { x: (vector.x * PUPIL_RADIUS) / module, y: (vector.y * PUPIL_RADIUS) / module };

        const eyeCircle: Path2D = new Path2D();
        eyeCircle.arc(position.x, position.y, EYE_RADIUS, 0, 2 * Math.PI);

        const pupil: Path2D = new Path2D();
        pupil.arc(position.x - directionnal.x, position.y - directionnal.y, PUPIL_RADIUS, 0, 2 * Math.PI);

        for (const context of ctx) {
            context.stroke(eyeCircle);
            context.fill(pupil);
        }
    }
    private getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private subscribeFoundDifferenceEvent(): void {
        this.foundDifferenceSubscription = this.differencesService.foundDifferenceObservable.subscribe((difference: Difference) => {
            this.foundDifferenceRoutine(difference);
        });
    }
    private subscribeErrorDifference(): void {
        this.errorDifferenceSubscription = this.differencesService.errorDifferenceObservable.subscribe(() => {
            this.errorDifferenceRoutine();
        });
    }
    private subscribeToCheatMode(): void {
        this.cheatModeSubscription = this.differencesService.cheatModeObservable.subscribe((difference: Difference[]) => {
            this.differencesService.drawAllDifferences(difference, this.cheatOriginalContext);
            this.differencesService.drawAllDifferences(difference, this.cheatModifiedContext);
            this.isCheatMode = true;
        });
    }

    private subscribeHint(): void {
        this.hintSubscription = this.differencesService.hintObservable.subscribe((pixelsPosition) => {
            this.drawHints(pixelsPosition);
        });
    }
    private subscribeHintButton(): void {
        this.hintButtonSubscription = this.eventHandlerService.hintButtonObservable.subscribe(() => {
            this.getHint();
        });
    }
    private subscribeToGameSwitch(): void {
        this.gameSwitchSubscription = this.differencesService.gameSwitchObservable.subscribe((gameId: string) => {
            this.changeImages(gameId);
        });
    }

    private changeImages(gameId: string): void {
        this.soundService.playCorrectSound();
        this.cheatModifiedContext.clearRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        this.cheatOriginalContext.clearRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        this.isCheatMode = false;
        this.originalImage.src = environment.serverUrl + '/image/original-image/' + gameId;
        this.modifiedImage.src = environment.serverUrl + '/image/modified-image/' + gameId;
        this.drawImages();
    }

    private getCanvasContext(): void {
        this.originalContext = this.originalCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.modifiedContext = this.modifiedCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.differenceContext = this.differenceCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.endContext = this.endCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.cheatOriginalContext = this.cheatOriginalCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.cheatModifiedContext = this.cheatModifiedCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.hintOriginalContext = this.hintOriginalCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.hintModifiedContext = this.hintModifiedCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }

    private drawImages(): void {
        this.originalImage.onload = () => {
            this.originalContext.drawImage(this.originalImage, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
            this.endContext.drawImage(this.originalImage, 0, 0);
        };
        this.modifiedImage.onload = () => {
            this.modifiedContext.drawImage(this.modifiedImage, 0, 0);
        };
    }

    private drawHint(subdivision: number, destination: CanvasRenderingContext2D, pixel: Coordinates): void {
        const sectionLenght = IMAGE_WIDTH / subdivision;
        const sectionHeight = IMAGE_HEIGHT / subdivision;

        const sectionX = Math.floor(pixel.x / sectionLenght);
        const sectionY = Math.floor(pixel.y / sectionHeight);

        destination.fillStyle = 'rgba(100,100,100,5)';
        destination.fillRect(sectionX * sectionLenght, sectionY * sectionHeight, sectionLenght, sectionHeight);
    }
    private foundDifferenceRoutine(difference: Difference): void {
        this.differencesService.drawDifference(difference, this.differenceContext);
        this.differencesService.makeDifferenceTransparent(difference, [this.modifiedContext, this.cheatOriginalContext, this.cheatModifiedContext]);

        this.soundService.playCorrectSound();
    }

    private errorDifferenceRoutine(): void {
        this.soundService.playIncorrectSound();
        this.disableInput();
        setTimeout(() => this.enableInput(), ONE_SECOND_IN_MS);
    }

    private disableInput(): void {
        this.error.nativeElement.style.top = this.mouseAbsolutePositionY + 'px';
        this.error.nativeElement.style.left = this.mouseAbsolutePositionX + 'px';
        this.error.nativeElement.textContent = 'ERREUR';
        this.originalCanvas.nativeElement.style.pointerEvents = 'none';
        this.modifiedCanvas.nativeElement.style.pointerEvents = 'none';
        this.endCanvas.nativeElement.style.pointerEvents = 'none';
        this.differenceCanvas.nativeElement.style.pointerEvents = 'none';
        this.cheatOriginalCanvas.nativeElement.style.pointerEvents = 'none';
        this.cheatModifiedCanvas.nativeElement.style.pointerEvents = 'none';
        this.hintModifiedCanvas.nativeElement.style.pointerEvents = 'none';
        this.hintOriginalCanvas.nativeElement.style.pointerEvents = 'none';
    }

    private enableInput(): void {
        this.error.nativeElement.textContent = null;
        this.originalCanvas.nativeElement.style.pointerEvents = 'auto';
        this.modifiedCanvas.nativeElement.style.pointerEvents = 'auto';
    }
}
