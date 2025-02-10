import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants/constant';
import { DifferencePopUpComponent } from './difference-pop-up.component';

describe('DifferencePopUpComponent', () => {
    let component: DifferencePopUpComponent;
    let fixture: ComponentFixture<DifferencePopUpComponent>;
    let baseContextStub: CanvasRenderingContext2D;
    const data: ImageData = new ImageData(IMAGE_WIDTH, IMAGE_HEIGHT);
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DifferencePopUpComponent],
            providers: [{ provide: MAT_DIALOG_DATA, useValue: data }],
            imports: [MatDialogModule, MatIconModule],
        }).compileComponents();

        fixture = TestBed.createComponent(DifferencePopUpComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        baseContextStub = CanvasTestHelper.createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(baseContextStub).toBeTruthy();
    });
});
