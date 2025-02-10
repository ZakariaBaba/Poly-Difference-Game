import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
    selector: 'app-difference-pop-up',
    templateUrl: './difference-pop-up.component.html',
    styleUrls: ['./difference-pop-up.component.scss'],
})
export class DifferencePopUpComponent implements AfterViewInit {
    @ViewChild('differenceCanvas', { static: false }) differenceCanvas: ElementRef<HTMLCanvasElement>;

    differenceContext: CanvasRenderingContext2D;

    constructor(@Inject(MAT_DIALOG_DATA) private data: ImageData) {}

    ngAfterViewInit(): void {
        this.differenceContext = this.differenceCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.differenceContext.putImageData(this.data, 0, 0);
    }
}
