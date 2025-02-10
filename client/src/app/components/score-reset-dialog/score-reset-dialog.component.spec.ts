import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { GameCardManagerService } from '@app/services/game-card-manager/game-card-manager.service';
import { PublicGame } from '@common/interfaces/public-game';

import { ScoreResetDialogComponent } from './score-reset-dialog.component';
import SpyObj = jasmine.SpyObj;

describe('ScoreResetDialogComponent', () => {
    let component: ScoreResetDialogComponent;
    let fixture: ComponentFixture<ScoreResetDialogComponent>;
    let mockGameCardManagerSpyObj: SpyObj<GameCardManagerService>;
    const data: PublicGame = {
        id: 'string',
        name: 'string',
        originalSource: 'string',
        modifiedSource: 'string',
        numberOfDifference: 4,
        isWaiting: false,
    };

    beforeEach(async () => {
        mockGameCardManagerSpyObj = jasmine.createSpyObj('GameCardManagerService', ['resetScore']);
        await TestBed.configureTestingModule({
            declarations: [ScoreResetDialogComponent],
            imports: [HttpClientTestingModule, MatDialogModule, MatIconModule],
            providers: [
                { provide: GameCardManagerService, useValue: mockGameCardManagerSpyObj },
                { provide: MAT_DIALOG_DATA, useValue: data },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ScoreResetDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should replace score of the game', () => {
        component.initScore();
        expect(mockGameCardManagerSpyObj.resetScore).toHaveBeenCalled();
    });
});
