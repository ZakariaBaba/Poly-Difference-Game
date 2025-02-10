/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatGridList } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MAX_NUMBER_CARDS_PER_PAGE } from '@app/constants/constant';
import { GameCardManagerService } from '@app/services/game-card-manager/game-card-manager.service';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { PlayerRequest } from '@common/interfaces/player-request';
import { PublicGame } from '@common/interfaces/public-game';
import { of } from 'rxjs';
import { GameSelectComponent } from './game-select.component';
import SpyObj = jasmine.SpyObj;
const routerStub = {
    navigateByUrl: () => {
        return;
    },
    url: '/admin',
};
const gameCardManagerServiceStub = {
    getGamesAtIndex: async () => {
        return Promise.resolve({
            listOfGames: [
                {
                    id: '1',
                    name: 'game1',
                    originalSource: 'originalSource1',
                    modifiedSource: 'originalSource2',
                    numberOfDifference: 0,
                },
                {
                    id: '2',
                    name: 'game1',
                    originalSource: 'originalSource1',
                    modifiedSource: 'originalSource2',
                    numberOfDifference: 0,
                },
                {
                    id: '3',
                    name: 'game1',
                    originalSource: 'originalSource1',
                    modifiedSource: 'originalSource2',
                    numberOfDifference: 0,
                },
                {
                    id: '4',
                    name: 'game1',
                    originalSource: 'originalSource1',
                    modifiedSource: 'originalSource2',
                    numberOfDifference: 0,
                },
                {
                    id: '5',
                    name: 'game1',
                    originalSource: 'originalSource1',
                    modifiedSource: 'originalSource2',
                    numberOfDifference: 0,
                },
            ],
            isThereMoreGames: true,
        });
    },
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
    statusObservable: of({}),
    requestObservable: of({}),
    gameCreatedObservable: of({}),
    playerLeftObservable: of({}),
    lobbyAlertObservable: of({}),
};

describe('GameSelectComponent', () => {
    let component: GameSelectComponent;
    let playerRequest: PlayerRequest;
    let mockMatDialog: SpyObj<MatDialog>;
    let windowSpy: Window;
    let fixture: ComponentFixture<GameSelectComponent>;
    beforeEach(async () => {
        playerRequest = {
            gameId: '1',
            playerName: 'la',
        };
        windowSpy = jasmine.createSpyObj('Window', ['alert']);
        mockMatDialog = jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);
        await TestBed.configureTestingModule({
            declarations: [GameSelectComponent, MatGridList],
            imports: [HttpClientModule, MatIconModule, HttpClientTestingModule],
            providers: [
                { provide: Router, useValue: routerStub },
                { provide: MatDialog, useValue: mockMatDialog },
                { provide: Window, useValue: windowSpy },
                { provide: GameCardManagerService, useValue: gameCardManagerServiceStub },
                { provide: LobbyService, useValue: lobbyServiceStub },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(GameSelectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('openScoreResetDialog should call matDialog.open', () => {
        const game: PublicGame = {
            id: 'string',
            name: 'string',
            originalSource: 'string',
            modifiedSource: 'string',
            numberOfDifference: 4,
            isWaiting: false,
        };
        component.openScoreResetDialog(game);
        expect(mockMatDialog.open).toHaveBeenCalled();
    });

    it('openScoreResetDialog should call matDialog.open', () => {
        const game: PublicGame = {
            id: 'string',
            name: 'string',
            originalSource: 'string',
            modifiedSource: 'string',
            numberOfDifference: 4,
            isWaiting: false,
        };
        component.openScoreResetDialog(game);
        expect(mockMatDialog.open).toHaveBeenCalled();
    });

    it('openResetAllDialogComponent should call matDialog.open', () => {
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
        component.openResetAllDialogComponent(game);
        expect(mockMatDialog.open).toHaveBeenCalled();
    });

    it('openTrashDialog should call matDialog.open', () => {
        component.openTrashDialog();
        expect(mockMatDialog.open).toHaveBeenCalled();
    });

    it('openDeleteConfirmationDialog should call matDialog.open', () => {
        const game: PublicGame = {
            id: 'string',
            name: 'string',
            originalSource: 'string',
            modifiedSource: 'string',
            numberOfDifference: 4,
            isWaiting: false,
        };
        component.openDeleteConfirmationDialog(game);
        expect(mockMatDialog.open).toHaveBeenCalled();
    });
    it('openConstantDialog should call matDialog.open', () => {
        component.openConstantDialog();
        expect(mockMatDialog.open).toHaveBeenCalled();
    });
    it('openRequestDialog should call matDialog.open', () => {
        component.openRequestDialog(playerRequest);
        expect(mockMatDialog.open).toHaveBeenCalled();
    });

    it('openingWaitDialog should open popup-wait-dialog', () => {
        component.openWaitDialog();
        expect(mockMatDialog.open).toHaveBeenCalled();
    });

    it('clicking on previous should decrease currentGame by 4', () => {
        component.currentGameIndex = MAX_NUMBER_CARDS_PER_PAGE;
        component.onPreviousClick();
        expect(component.currentGameIndex).toBe(0);
    });

    it('clicking on next should increase currentGame by 4', () => {
        component.currentGameIndex = 0;
        component.onNextClick();
        expect(component.currentGameIndex).toBe(MAX_NUMBER_CARDS_PER_PAGE);
    });

    it('navigate to administration page should set isAdmin to true', () => {
        expect(component.isAdmin).toBeTruthy();
    });
    it(' openPlayerNameDialog should open a matDialog', () => {
        component.openPlayerNameDialog();
        expect(mockMatDialog.open).toHaveBeenCalled();
    });
    it(' createLobby should create a lobby once the dialog is closed', () => {
        const spyCreateLobby = spyOn(lobbyServiceStub, 'createLobby');
        const spyWaitDialog = spyOn(component, 'openWaitDialog');
        mockMatDialog.open.and.returnValue({ afterClosed: () => of(true) } as unknown as MatDialogRef<typeof mockMatDialog>);
        component.createLobby('2');
        expect(component['matDialog']).toBeDefined();
        expect(spyCreateLobby).toHaveBeenCalled();
        expect(spyWaitDialog).toHaveBeenCalled();
    });
    it(' StartSolo should start solo game', () => {
        const spyStartSolo = spyOn(lobbyServiceStub, 'startSoloGame');
        const spyRouter = spyOn(routerStub, 'navigateByUrl');
        mockMatDialog.open.and.returnValue({ afterClosed: () => of(true) } as unknown as MatDialogRef<typeof mockMatDialog>);
        component.openPlayerNameDialog();
        component.startSolo('2');
        expect(component['matDialog']).toBeDefined();
        expect(spyStartSolo).toHaveBeenCalled();
        expect(spyRouter).toHaveBeenCalled();
        expect(mockMatDialog.open).toHaveBeenCalled();
    });
    it(' joinLobby should let the player join a lobby', () => {
        const spyJoinLobby = spyOn(lobbyServiceStub, 'joinLobby');
        const spyWaitDialog = spyOn(component, 'openWaitDialog');
        mockMatDialog.open.and.returnValue({ afterClosed: () => of(true) } as unknown as MatDialogRef<typeof mockMatDialog>);
        component.joinLobby('2');
        expect(component['matDialog']).toBeDefined();
        expect(spyJoinLobby).toHaveBeenCalled();
        expect(spyWaitDialog).toHaveBeenCalled();
    });
});
