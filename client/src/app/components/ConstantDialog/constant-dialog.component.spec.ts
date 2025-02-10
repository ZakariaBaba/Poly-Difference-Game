import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstantDialogComponent } from './constant-dialog.component';

describe('ConstantDialogComponent', () => {
    let component: ConstantDialogComponent;
    let fixture: ComponentFixture<ConstantDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConstantDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ConstantDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
