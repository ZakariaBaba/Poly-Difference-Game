import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { GameCardManagerService } from '@app/services/game-card-manager/game-card-manager.service';
import { PublicGame } from '@common/interfaces/public-game';

import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import SpyObj = jasmine.SpyObj;

describe('ConfirmationDialogComponent', () => {
    let component: ConfirmationDialogComponent;
    let fixture: ComponentFixture<ConfirmationDialogComponent>;
    const data: PublicGame = {
        id: 'string',
        name: 'string',
        originalSource: 'string',
        modifiedSource: 'string',
        numberOfDifference: 4,
        isWaiting: false,
    };
    let mockGameCardManagerSpyObj: SpyObj<GameCardManagerService>;
    beforeEach(async () => {
        mockGameCardManagerSpyObj = jasmine.createSpyObj('GameCardManagerService', [
            'getGamesAtIndex',
            'initialize',
            'connectSocket',
            'listenLobbyEvent',
            'createLobby',
            'leaveLobby',
            'joinLobby',
            'acceptPlayer',
            'rejectPlayer',
            'startSoloGame',
            'deleteGame',
            'handleError',
            'alertDeleteGame',
        ]);
        await TestBed.configureTestingModule({
            declarations: [ConfirmationDialogComponent],
            imports: [HttpClientTestingModule, MatDialogModule, MatIconModule],
            providers: [
                { provide: GameCardManagerService, useValue: mockGameCardManagerSpyObj },
                { provide: MAT_DIALOG_DATA, useValue: data },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfirmationDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should delete the game', () => {
        component.deleteGame();
        expect(mockGameCardManagerSpyObj.deleteGame).toHaveBeenCalled();
    });
});
