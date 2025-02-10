import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DifferencePopUpComponent } from '@app/components/difference-pop-up/difference-pop-up.component';
import { SaveConfirmationDialogComponent } from '@app/components/save-confirmation-dialog/save-confirmation-dialog.component';
import { SaveGameDialogComponent } from '@app/components/save-game-dialog/save-game-dialog.component';
import { AVAILABLE_RADIUS, DEFAULT_RADIUS, IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants/constant';
import { PrivateGame, SavedGameMessage } from '@app/interfaces/game';
import { DifferenceGenerationService } from '@app/services/differences/difference-generation.service';
import { EventHandlerService } from '@app/services/event-handler/event-handler.service';
import { GameCreationService } from '@app/services/game-creation/game-creation.service';
import { GuidelinesDialogComponent } from '@app/components/guidelines-dialog/guidelines-dialog.component';

@Component({
    selector: 'app-zone-edit',
    templateUrl: './zone-edit.component.html',
    styleUrls: ['./zone-edit.component.scss'],
})
export class ZoneEditComponent implements AfterViewInit, OnDestroy, OnInit {
    // Canvas for image
    @ViewChild('orginalCanvas', { static: false }) orginalCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('modifiedCanvas', { static: false }) modifiedCanvas: ElementRef<HTMLCanvasElement>;
    // Canvas to preview the changes on the drawing area
    @ViewChild('orginalPreview', { static: false }) orginalPreview: ElementRef<HTMLCanvasElement>;
    @ViewChild('modifiedPreview', { static: false }) modifiedPreview: ElementRef<HTMLCanvasElement>;
    // Canvas to draw on
    @ViewChild('orginalDrawing', { static: false }) originalDrawing: ElementRef<HTMLCanvasElement>;
    @ViewChild('modifiedDrawing', { static: false }) modifiedDrawing: ElementRef<HTMLCanvasElement>;

    @Input() differenceData: ImageData;

    originalContext: CanvasRenderingContext2D;
    modifiedContext: CanvasRenderingContext2D;
    orginalPreviewContext: CanvasRenderingContext2D;
    modifiedPreviewContext: CanvasRenderingContext2D;
    originalDrawingContext: CanvasRenderingContext2D;
    modifiedDrawingContext: CanvasRenderingContext2D;
    originalUploadContext: CanvasRenderingContext2D;
    modifiedUploadContext: CanvasRenderingContext2D;

    differenceNumber: number = 0;
    selectedRadius: number = DEFAULT_RADIUS;
    availableRadius = AVAILABLE_RADIUS;

    hasSetCanvasOriginal: boolean = false;
    hasSetCanvasModified: boolean = false;

    hasDrawnCanvasOriginal: boolean = false;
    hasDrawnCanvasModified: boolean = false;

    canGetDifferences: boolean = false;

    // eslint-disable-next-line max-params
    constructor(
        private gameCreationService: GameCreationService,
        private matDialog: MatDialog,
        private differenceService: DifferenceGenerationService,
        private eventHandlerService: EventHandlerService,
    ) {}

    @HostListener('document:keydown.control.z')
    ctrlZ() {
        this.eventHandlerService.onCtrlZ();
        this.differenceNumber = 0;
    }

    @HostListener('document:keydown.control.shift.z')
    ctrlShiftZ() {
        this.eventHandlerService.onCtrlShiftZ();
        this.differenceNumber = 0;
    }

    onMouseDown(event: MouseEvent, drawingContext: CanvasRenderingContext2D, previewContext: CanvasRenderingContext2D): void {
        this.eventHandlerService.onMouseDown({ event, drawingContext, previewContext });
        this.differenceNumber = 0;
    }

    onMouseMove(event: MouseEvent, drawingContext: CanvasRenderingContext2D, previewContext: CanvasRenderingContext2D): void {
        const enableCanvas = (ctx: CanvasRenderingContext2D) => {
            this.setDrawCanvasFlags(ctx, true);
            this.setCanGetDifference();
        };
        this.eventHandlerService.onMouseMove({ event, drawingContext, previewContext, callback: enableCanvas });
    }

    onMouseUp(event: MouseEvent, drawingContext: CanvasRenderingContext2D, previewContext: CanvasRenderingContext2D): void {
        const enableCanvas = (ctx: CanvasRenderingContext2D) => {
            this.setDrawCanvasFlags(ctx, true);
            this.setCanGetDifference();
        };
        this.eventHandlerService.onMouseUp({ event, drawingContext, previewContext, callback: enableCanvas });
    }

    openGuidelineDialog(): void {
        this.matDialog.open(GuidelinesDialogComponent, { disableClose: true, height: '790px', width: '1050px', panelClass: 'my-dialog' });
    }

    ngOnInit(): void {
        this.gameCreationService.subscribeToUserInput();
    }

    ngAfterViewInit(): void {
        this.originalContext = this.orginalCanvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.modifiedContext = this.modifiedCanvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.originalContext.fillStyle = 'white';
        this.modifiedContext.fillStyle = 'white';
        this.originalContext.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        this.modifiedContext.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        this.orginalPreviewContext = this.orginalPreview.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.modifiedPreviewContext = this.modifiedPreview.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.originalDrawingContext = this.originalDrawing.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.modifiedDrawingContext = this.modifiedDrawing.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.originalUploadContext = CanvasTestHelper.createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT).getContext('2d', {
            willReadFrequently: true,
        }) as CanvasRenderingContext2D;
        this.modifiedUploadContext = CanvasTestHelper.createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT).getContext('2d', {
            willReadFrequently: true,
        }) as CanvasRenderingContext2D;
    }

    ngOnDestroy() {
        this.gameCreationService.unsubscribeToUserInput();
    }

    setRadius(entry: number) {
        this.selectedRadius = entry;
        this.setCanGetDifference();
    }

    clearBackground(ctx: CanvasRenderingContext2D): void {
        ctx.clearRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        this.setCanvasFlags(ctx, false);
        this.setCanGetDifference();
        this.differenceNumber = 0;
    }

    clearCanvas(ctx: CanvasRenderingContext2D): void {
        this.gameCreationService.onClear(ctx);
        this.setDrawCanvasFlags(ctx, false);
        this.setCanGetDifference();
        this.differenceNumber = 0;
    }

    async loadImage(image: HTMLInputElement, ctx: CanvasRenderingContext2D, ctx2?: CanvasRenderingContext2D): Promise<void> {
        await this.gameCreationService.loadImage(image.files?.item(0) as File, ctx, ctx2);
        this.setCanvasFlags(ctx, true, ctx2);
        this.setCanGetDifference();
        this.differenceNumber = 0;
    }

    showDifference(): void {
        this.putDataOnUploadCanvas();
        this.differenceService.generateNewData(
            this.originalUploadContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT),
            this.modifiedUploadContext.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT),
            this.selectedRadius,
        );
        this.differenceNumber = this.differenceService.getDifferenceAmount();
        this.matDialog.open(DifferencePopUpComponent, {
            disableClose: true,
            panelClass: 'my-dialog',
            data: this.differenceService.getDifferenceImage(),
        });
    }

    openSaveGameDialog(): void {
        const dialogRef = this.matDialog.open(SaveGameDialogComponent, { disableClose: true, panelClass: 'my-dialog' });
        dialogRef.afterClosed().subscribe((gameName) => {
            const data: PrivateGame = {
                name: gameName,
                originalImage: this.originalUploadContext.canvas.toDataURL('image/png'),
                modifiedImage: this.modifiedUploadContext.canvas.toDataURL('image/png'),
                time: ['3:13', '4:08', '7:15'],
                numberOfDifference: this.differenceService.getDifferenceAmount(),
                arrayOfDifference: this.differenceService.getDifferencesCoordinates(),
            };
            this.saveGame(data);
        });
    }

    saveGame(data: PrivateGame): void {
        this.gameCreationService.gameUpload(data).subscribe((response) => {
            if (response) {
                const message: SavedGameMessage = {
                    text: 'Votre jeu a été sauvegardé avec succès!',
                    isSaved: true,
                };
                this.matDialog.open(SaveConfirmationDialogComponent, { data: message, disableClose: true, panelClass: 'my-dialog' });
            } else {
                const message: SavedGameMessage = {
                    text: "Une erreur s'est produite lors de la sauvegarde. ",
                    isSaved: false,
                };
                this.matDialog.open(SaveConfirmationDialogComponent, { data: message, disableClose: true, panelClass: 'my-dialog' });
            }
        });
    }

    switchBothDrawingContext(ctx: CanvasRenderingContext2D, ctx2: CanvasRenderingContext2D): void {
        this.gameCreationService.onExchange(ctx, ctx2);
        this.differenceNumber = 0;
    }

    switchDrawingContext(ctx: CanvasRenderingContext2D, ctx2: CanvasRenderingContext2D): void {
        this.gameCreationService.onTransfer(ctx2, ctx);
        this.setDrawCanvasFlags(ctx2, true);
        this.setCanGetDifference();
        this.differenceNumber = 0;
    }

    private putDataOnUploadCanvas(): void {
        if (!this.hasSetCanvasOriginal) {
            this.originalUploadContext.fillStyle = 'white';
            this.originalUploadContext.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        } else {
            this.originalUploadContext.drawImage(this.orginalCanvas.nativeElement, 0, 0);
        }
        this.originalUploadContext.drawImage(this.originalDrawing.nativeElement, 0, 0);

        if (!this.hasSetCanvasModified) {
            this.modifiedUploadContext.fillStyle = 'white';
            this.modifiedUploadContext.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        } else {
            this.modifiedUploadContext.drawImage(this.modifiedCanvas.nativeElement, 0, 0);
        }
        this.modifiedUploadContext.drawImage(this.modifiedDrawing.nativeElement, 0, 0);
    }

    private setCanGetDifference() {
        this.canGetDifferences = this.hasSetCanvasOriginal || this.hasDrawnCanvasOriginal || this.hasSetCanvasModified || this.hasDrawnCanvasModified;
    }

    private setDrawCanvasFlags(ctx: CanvasRenderingContext2D, target: boolean) {
        if (ctx === this.originalDrawingContext) {
            this.hasDrawnCanvasOriginal = target;
        }
        if (ctx === this.modifiedDrawingContext) {
            this.hasDrawnCanvasModified = target;
        }
    }

    private setCanvasFlags(ctx: CanvasRenderingContext2D, target: boolean, ctx2?: CanvasRenderingContext2D): void {
        if (ctx === this.originalContext || ctx2 === this.originalContext) {
            this.hasSetCanvasOriginal = target;
        }
        if (ctx === this.modifiedContext || ctx2 === this.modifiedContext) {
            this.hasSetCanvasModified = target;
        }
    }
}
