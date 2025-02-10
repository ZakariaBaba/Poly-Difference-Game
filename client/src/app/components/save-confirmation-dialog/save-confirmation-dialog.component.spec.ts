import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SavedGameMessage } from '@app/interfaces/game';
import { SaveConfirmationDialogComponent } from './save-confirmation-dialog.component';

const mockMatDialogRef = {
    close: () => {
        return;
    },
};
describe('SaveConfirmationDialogComponent', () => {
    let component: SaveConfirmationDialogComponent;
    let fixture: ComponentFixture<SaveConfirmationDialogComponent>;
    const data: SavedGameMessage = {
        text: 'allo',
        isSaved: true,
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SaveConfirmationDialogComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: data },
                { provide: MatDialogRef, useValue: mockMatDialogRef },
            ],
            imports: [MatDialogModule],
        }).compileComponents();

        fixture = TestBed.createComponent(SaveConfirmationDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('onClose should close the dialog', () => {
        const matDialogSpy = spyOn(mockMatDialogRef, 'close');
        component.onClose();
        expect(matDialogSpy).toHaveBeenCalled();
    });
});
