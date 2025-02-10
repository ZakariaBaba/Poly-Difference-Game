import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { GameCardManagerService } from '@app/services/game-card-manager/game-card-manager.service';
import { LobbyService } from '@app/services/lobby/lobby.service';

import { WaitDialogComponent } from './wait-dialog.component';
import SpyObj = jasmine.SpyObj;

const lobbyServiceStub = {
    leaveLobby: () => {
        return;
    },
};

describe('WaitDialogComponent', () => {
    let component: WaitDialogComponent;
    let fixture: ComponentFixture<WaitDialogComponent>;
    let mockMatDialogRef: SpyObj<MatDialogRef<WaitDialogComponent>>;
    let mockGameCardManagerSpyObj: SpyObj<GameCardManagerService>;

    beforeEach(async () => {
        mockGameCardManagerSpyObj = jasmine.createSpyObj('GameCardManagerService', ['getGamesAtIndex']);
        mockMatDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
        await TestBed.configureTestingModule({
            declarations: [WaitDialogComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: GameCardManagerService, useValue: mockGameCardManagerSpyObj },
                { provide: MatDialogRef, useValue: mockMatDialogRef },
                { provide: LobbyService, useValue: lobbyServiceStub },
            ],
            imports: [MatDialogModule, MatIconModule],
        }).compileComponents();

        fixture = TestBed.createComponent(WaitDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close the dialog and leave the lobby', () => {
        const spyLeaveLobby = spyOn(lobbyServiceStub, 'leaveLobby');
        component.onClose();
        expect(spyLeaveLobby).toHaveBeenCalled();
        expect(mockMatDialogRef.close).toHaveBeenCalled();
    });
});
