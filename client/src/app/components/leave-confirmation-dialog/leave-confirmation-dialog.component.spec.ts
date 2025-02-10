import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';

import { LeaveConfirmationDialogComponent } from './leave-confirmation-dialog.component';

describe('LeaveConfirmationDialogComponent', () => {
    let component: LeaveConfirmationDialogComponent;
    let fixture: ComponentFixture<LeaveConfirmationDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LeaveConfirmationDialogComponent],
            imports: [MatDialogModule],
        }).compileComponents();

        fixture = TestBed.createComponent(LeaveConfirmationDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
