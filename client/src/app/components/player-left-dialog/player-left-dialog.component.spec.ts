import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { PlayerLeftDialogComponent } from './player-left-dialog.component';

const mockMatDialogRef = {
    close: () => {
        return;
    },
};

describe('PlayerLeftDialogComponent', () => {
    let component: PlayerLeftDialogComponent;
    let fixture: ComponentFixture<PlayerLeftDialogComponent>;
    let data: string;

    beforeEach(async () => {
        data = 'message';
        await TestBed.configureTestingModule({
            declarations: [PlayerLeftDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: mockMatDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: data },
            ],
            imports: [MatDialogModule],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayerLeftDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('continueSolo should close the dialog', () => {
        const matDialogSpy = spyOn(mockMatDialogRef, 'close');
        component.continueSolo();
        expect(matDialogSpy).toHaveBeenCalled();
    });

    it('leave should close the dialog', () => {
        const matDialogSpy = spyOn(mockMatDialogRef, 'close');
        component.leave();
        expect(matDialogSpy).toHaveBeenCalled();
    });
});
