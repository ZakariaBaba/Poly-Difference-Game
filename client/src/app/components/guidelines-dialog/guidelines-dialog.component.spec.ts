import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { GuidelinesDialogComponent } from './guidelines-dialog.component';

const mockMatDialogRef = {
    close: () => {
        return;
    },
};

describe('GuidelinesDialogComponent', () => {
    let component: GuidelinesDialogComponent;
    let fixture: ComponentFixture<GuidelinesDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GuidelinesDialogComponent],
            providers: [{ provide: MatDialogRef, useValue: mockMatDialogRef }],
            imports: [MatIconModule],
        }).compileComponents();

        fixture = TestBed.createComponent(GuidelinesDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call close if enter is called', () => {
        const element = fixture.nativeElement;
        fixture.detectChanges();
        const event = new KeyboardEvent('keypress', {
            key: 'Enter',
        });
        element.dispatchEvent(event);

        const spy = spyOn(component, 'close');
        component.onDialogClick(event);
        expect(spy).toHaveBeenCalled();
    });

    it('close should close the dialog', () => {
        const matDialogSpy = spyOn(mockMatDialogRef, 'close');
        component.close();
        expect(matDialogSpy).toHaveBeenCalled();
    });
});
