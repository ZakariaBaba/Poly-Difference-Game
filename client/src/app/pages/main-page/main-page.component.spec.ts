import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { GameCardManagerService } from '@app/services/game-card-manager/game-card-manager.service';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { GameType } from '@common/constants';
import { PlayerRequest } from '@common/interfaces/player-request';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;
const routerStub = {
    navigateByUrl: () => {
        return;
    },
    url: '/game',
};
const lobbyServiceStub = {
    initialize: () => {
        return;
    },
    createLobby: () => {
        return;
    },
    joinLobby: () => {
        return;
    },
    startSoloGame: () => {
        return;
    },
    leaveLobby: () => {
        return;
    },
    createSprintLobby: () => {
        return;
    },
    startSoloSprintGame: () => {
        return;
    },
    statusObservable: of({}),
    requestObservable: of({}),
    gameCreatedObservable: of({}),
    playerLeftObservable: of({}),
    lobbyAlertObservable: of({}),
    waitObservable: of({}),
    startSprintObservable: of({}),
};

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let mockMatDialog: SpyObj<MatDialog>;
    let mockGameCardManagerService: SpyObj<GameCardManagerService>;
    let playerRequest: PlayerRequest;

    beforeEach(async () => {
        mockMatDialog = jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);
        mockGameCardManagerService = jasmine.createSpyObj('GameCardManagerService', ['getGamesAtIndex']);
        await TestBed.configureTestingModule({
            imports: [HttpClientModule, MatDialogModule],
            providers: [
                { provide: Router, useValue: routerStub },
                { provide: LobbyService, useValue: lobbyServiceStub },
                { provide: GameCardManagerService, useValue: mockGameCardManagerService },
                { provide: MatDialog, useValue: mockMatDialog },
            ],
            declarations: [MainPageComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call createSprintLobby', () => {
        const spy = spyOn(lobbyServiceStub, 'createSprintLobby');
        component.createSprintLobby('h');
        expect(spy).toHaveBeenCalled();
    });

    it('should call startSoloSprintGame', () => {
        const spy = spyOn(lobbyServiceStub, 'startSoloSprintGame');
        component.startSoloSprintGame('h');
        expect(spy).toHaveBeenCalled();
    });

    it(' openSprintPlayerNameDialog should open a matDialog', () => {
        component.openSprintPlayerNameDialog();
        expect(mockMatDialog.open).toHaveBeenCalled();
    });

    it(' startSprint should create a lobby once the dialog is closed', async () => {
        playerRequest = {
            gameId: '1',
            playerName: 'la',
            type: GameType.Solo,
        };
        const spyStartSoloSprintGame = spyOn(lobbyServiceStub, 'startSoloSprintGame');
        const spyRouter = spyOn(routerStub, 'navigateByUrl');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyExistingGames = spyOn<any>(component, 'existingGames');
        spyExistingGames.and.resolveTo(true);

        mockMatDialog.open.and.returnValue({ afterClosed: () => of(playerRequest) } as unknown as MatDialogRef<typeof mockMatDialog>);
        await component.startSprint();

        expect(component['matDialog']).toBeDefined();
        expect(spyStartSoloSprintGame).toHaveBeenCalled();
        expect(spyRouter).toHaveBeenCalled();
        expect(mockMatDialog.open).toHaveBeenCalled();
    });

    it(' startSprint should create a lobby once the dialog is closed', async () => {
        playerRequest = {
            gameId: '1',
            playerName: 'la',
            type: GameType.Multiplayer,
        };

        const spyCreateSprintLobby = spyOn(lobbyServiceStub, 'createSprintLobby');
        mockMatDialog.open.and.returnValue({ afterClosed: () => of(playerRequest) } as unknown as MatDialogRef<typeof mockMatDialog>);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyExistingGames = spyOn<any>(component, 'existingGames');
        spyExistingGames.and.resolveTo(true);

        await component.startSprint();

        expect(component['matDialog']).toBeDefined();
        expect(spyCreateSprintLobby).toHaveBeenCalled();
        expect(mockMatDialog.open).toHaveBeenCalled();
    });

    it('startSprint should call window.alert if there is no available games', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyExistingGames = spyOn<any>(component, 'existingGames');
        spyExistingGames.and.resolveTo(false);
        const spyNoGamesDialog = spyOn(component, 'openNoGamesDialog');

        await component.startSprint();

        expect(spyNoGamesDialog).toHaveBeenCalled();
    });
});
