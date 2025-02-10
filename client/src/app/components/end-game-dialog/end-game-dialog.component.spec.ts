import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { EndGameDialogComponent } from './end-game-dialog.component';

describe('EndGameDialogComponent', () => {
    let component: EndGameDialogComponent;
    let fixture: ComponentFixture<EndGameDialogComponent>;
    let data: {
        endGameMessage: 'endMessage';
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [EndGameDialogComponent],
            providers: [{ provide: MAT_DIALOG_DATA, useValue: data }],
            imports: [MatDialogModule],
        }).compileComponents();

        fixture = TestBed.createComponent(EndGameDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
