import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { GameCardManagerService } from '@app/services/game-card-manager/game-card-manager.service';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { RequestDialogComponent } from './request-dialog.component';
import SpyObj = jasmine.SpyObj;

const lobbyServiceStub = {
    acceptPlayer: () => {
        return;
    },
    rejectPlayer: () => {
        return;
    },
};

describe('RequestDialogComponent', () => {
    let component: RequestDialogComponent;
    let fixture: ComponentFixture<RequestDialogComponent>;
    let mockMatDialog: SpyObj<MatDialog>;
    let mockGameCardManagerSpyObj: SpyObj<GameCardManagerService>;

    beforeEach(async () => {
        mockGameCardManagerSpyObj = jasmine.createSpyObj('GameCardManagerService', ['getGamesAtIndex']);
        mockMatDialog = jasmine.createSpyObj('MatDialog', ['closeAll', 'open']);
        await TestBed.configureTestingModule({
            declarations: [RequestDialogComponent],
            providers: [
                { provide: MatDialog, useValue: mockMatDialog },
                { provide: GameCardManagerService, useValue: mockGameCardManagerSpyObj },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: LobbyService, useValue: lobbyServiceStub },
            ],
            imports: [MatDialogModule, MatIconModule],
        }).compileComponents();
        fixture = TestBed.createComponent(RequestDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should acceptPlayer when the user accept', () => {
        const spyAcceptPlayer = spyOn(lobbyServiceStub, 'acceptPlayer');
        component.acceptPlayer();
        expect(spyAcceptPlayer).toHaveBeenCalled();
    });
    it('should rejectPlayer when the user reject the invitation', () => {
        const spyRejectPlayer = spyOn(lobbyServiceStub, 'rejectPlayer');
        component.rejectPlayer();
        expect(spyRejectPlayer).toHaveBeenCalled();
        expect(mockMatDialog.closeAll).toHaveBeenCalled();
        expect(mockMatDialog.open).toHaveBeenCalled();
    });
});
