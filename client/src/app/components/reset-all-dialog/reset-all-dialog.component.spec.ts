import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { GameCardManagerService } from '@app/services/game-card-manager/game-card-manager.service';
import { PublicGame } from '@common/interfaces/public-game';

import { ResetAllDialogComponent } from './reset-all-dialog.component';
import SpyObj = jasmine.SpyObj;

describe('ResetAllDialogComponent', () => {
    let component: ResetAllDialogComponent;
    let fixture: ComponentFixture<ResetAllDialogComponent>;
    let mockGameCardManagerSpyObj: SpyObj<GameCardManagerService>;
    let data: 'gameId';

    beforeEach(async () => {
        mockGameCardManagerSpyObj = jasmine.createSpyObj('GameCardManagerService', ['resetAllScore']);
        await TestBed.configureTestingModule({
            declarations: [ResetAllDialogComponent],
            imports: [HttpClientTestingModule, MatDialogModule, MatIconModule],
            providers: [
                { provide: GameCardManagerService, useValue: mockGameCardManagerSpyObj },
                { provide: MAT_DIALOG_DATA, useValue: data },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(ResetAllDialogComponent);
        component = fixture.componentInstance;
        spyOn(component, 'reloadWindow');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should replace score of the game', async () => {
        // spy on GameCardManager service and mock the return value
        const game: PublicGame[] = [
            {
                id: 'string',
                name: 'string',
                originalSource: 'string',
                modifiedSource: 'string',
                numberOfDifference: 4,
                isWaiting: false,
            },
            { id: 'string1', name: 'string1', originalSource: 'string1', modifiedSource: 'string1', numberOfDifference: 2, isWaiting: false },
        ];
        component.games = game;
        await component.initAllScore();
        expect(component.reloadWindow).toHaveBeenCalled();
    });
});
