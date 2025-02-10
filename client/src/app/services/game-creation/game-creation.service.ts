import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PrivateGame } from '@app/interfaces/game';
import { EventHandlerService } from '@app/services/event-handler/event-handler.service';
import { ToolService } from '@app/services/tool/tool.service';
import { ConstantParameter } from '@common/interfaces/public-game';
import { lastValueFrom, Observable, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
    providedIn: 'root',
})
export class GameCreationService {
    private readonly baseUrl: string = environment.serverUrl;
    private reader: FileReader = new FileReader();
    private mouseDownSubscription: Subscription;
    private mouseUpSubscription: Subscription;
    private mouseMoveSubscription: Subscription;
    private ctrlZSubscription: Subscription;
    private ctrlShiftZSubscription: Subscription;

    constructor(private readonly http: HttpClient, private eventHandlerService: EventHandlerService, private toolService: ToolService) {}

    gameUpload(data: PrivateGame): Observable<boolean> {
        return this.http.post<boolean>(`${this.baseUrl}/game`, data);
    }

    setConstantGame(data: ConstantParameter) {
        return this.http.post<ConstantParameter>(`${this.baseUrl}/game/constant`, data);
    }

    onExchange(context1: CanvasRenderingContext2D, context2: CanvasRenderingContext2D): void {
        this.toolService.exchange(context1, context2);
    }

    onTransfer(context1: CanvasRenderingContext2D, context2: CanvasRenderingContext2D): void {
        this.toolService.transfer(context1, context2);
    }

    onClear(context1: CanvasRenderingContext2D, context2?: CanvasRenderingContext2D): void {
        this.toolService.clear(context1);
        if (context2) {
            this.toolService.clear(context2);
        }
    }
    async loadImage(image: File, ctx: CanvasRenderingContext2D, ctx2?: CanvasRenderingContext2D) {
        await this.isSize(image)
            .catch((err) => {
                window.alert(err.error);
            })
            .then((res) => {
                if (res?.status === HttpStatusCode.Ok) {
                    this.reader.onload = (event) => {
                        this.createImage(event, ctx, ctx2);
                    };
                    this.reader.readAsDataURL(image as File);
                }
            });
    }

    subscribeToUserInput(): void {
        this.onMouseDown();
        this.onMouseMove();
        this.onMouseUp();
        this.onCtrlZ();
        this.onCtrlShiftZ();
    }
    unsubscribeToUserInput(): void {
        this.mouseDownSubscription.unsubscribe();
        this.mouseUpSubscription.unsubscribe();
        this.mouseMoveSubscription.unsubscribe();
        this.ctrlZSubscription.unsubscribe();
        this.ctrlShiftZSubscription.unsubscribe();
    }

    private onMouseDown(): void {
        this.mouseDownSubscription = this.eventHandlerService.mouseDownObservable.subscribe((mouseEvent) => {
            this.toolService.onMouseDown(mouseEvent);
        });
    }

    private onMouseUp(): void {
        this.mouseUpSubscription = this.eventHandlerService.mouseUpObservable.subscribe((mouseEvent) => {
            this.toolService.onMouseUp(mouseEvent);
        });
    }

    private onMouseMove(): void {
        this.mouseMoveSubscription = this.eventHandlerService.mouseMoveObservable.subscribe((mouseEvent) => {
            this.toolService.onMouseMove(mouseEvent);
        });
    }

    private onCtrlZ(): void {
        this.ctrlZSubscription = this.eventHandlerService.ctrlZObservable.subscribe(() => {
            this.toolService.undo();
        });
    }

    private onCtrlShiftZ(): void {
        this.ctrlShiftZSubscription = this.eventHandlerService.ctrlShiftZObservable.subscribe(() => {
            this.toolService.redo();
        });
    }

    private async isSize(image: File) {
        const formData: FormData = new FormData();
        formData.append('image', image as File, image.name);
        return lastValueFrom(this.http.post(`${this.baseUrl}/image`, formData, { observe: 'response', responseType: 'text' }));
    }
    private createImage(event: ProgressEvent<FileReader>, ctx: CanvasRenderingContext2D, ctx2?: CanvasRenderingContext2D) {
        const newImage = new Image();
        newImage.onload = () => {
            ctx.drawImage(newImage, 0, 0);
            ctx2?.drawImage(newImage, 0, 0);
        };
        newImage.src = event.target?.result as string;
    }
}
