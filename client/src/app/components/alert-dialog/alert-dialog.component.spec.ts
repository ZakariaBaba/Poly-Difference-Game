import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AlertDialogComponent } from './alert-dialog.component';

describe('AlertDialogComponent', () => {
    let component: AlertDialogComponent;
    let fixture: ComponentFixture<AlertDialogComponent>;
    let data: {
        message: 'testMessage';
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AlertDialogComponent],
            providers: [{ provide: MAT_DIALOG_DATA, useValue: data }],
            imports: [MatDialogModule, MatIconModule],
        }).compileComponents();

        fixture = TestBed.createComponent(AlertDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
