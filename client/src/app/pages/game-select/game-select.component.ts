import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertDialogComponent } from '@app/components/alert-dialog/alert-dialog.component';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationTrashDialogComponent } from '@app/components/confirmation-trash-dialog/confirmation-trash-dialog.component';
import { ConstantDialogComponent } from '@app/components/constant-dialog/constant-dialog.component';
import { PlayerNameDialogComponent } from '@app/components/player-name-dialog/player-name-dialog.component';
import { RequestDialogComponent } from '@app/components/request-dialog/request-dialog.component';
import { ResetAllDialogComponent } from '@app/components/reset-all-dialog/reset-all-dialog.component';
import { ScoreResetDialogComponent } from '@app/components/score-reset-dialog/score-reset-dialog.component';
import { WaitDialogComponent } from '@app/components/wait-dialog/wait-dialog.component';
import { ADMIN_PAGE_PATH, GAME_PAGE_PATH, MAX_NUMBER_CARDS_PER_PAGE } from '@app/constants/constant';
import { GameCardManagerService } from '@app/services/game-card-manager/game-card-manager.service';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { GameCardInfo } from '@common/interfaces/game-card-info';
import { PlayerRequest } from '@common/interfaces/player-request';
import { PublicGame } from '@common/interfaces/public-game';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-game-select',
    templateUrl: './game-select.component.html',
    styleUrls: ['./game-select.component.scss'],
})
export class GameSelectComponent implements OnInit, OnDestroy {
    games: PublicGame[] = [];
    currentGameIndex: number = 0;
    isAdmin: boolean = false;
    isNextButtonEnabled: boolean = false;
    serverUrl = environment.serverUrl;

    subscriptionMap: Map<string, Subscription> = new Map();

    // eslint-disable-next-line max-params
    constructor(
        private router: Router,
        private matDialog: MatDialog,
        private gameCardManagerService: GameCardManagerService,
        private lobbyService: LobbyService,
    ) {
        if (this.router.url === ADMIN_PAGE_PATH) {
            this.isAdmin = true;
        }
    }

    ngOnInit(): void {
        this.lobbyService.initialize();
        this.getGames();

        this.subscriptionMap.set(
            'lobbyStatusSubscription',
            this.lobbyService.statusObservable.subscribe(() => {
                this.getGames();
            }),
        );
        this.subscriptionMap.set(
            'gameRequestSubscription',
            this.lobbyService.requestObservable.subscribe((joinRequest: PlayerRequest) => {
                this.matDialog.closeAll();
                this.openRequestDialog(joinRequest);
            }),
        );
        this.subscriptionMap.set(
            'gameCreatedSubscription',
            this.lobbyService.gameCreatedObservable.subscribe(() => {
                this.matDialog.closeAll();
                this.router.navigateByUrl(GAME_PAGE_PATH);
            }),
        );
        this.subscriptionMap.set(
            'playerLeftSubscription',
            this.lobbyService.playerLeftObservable.subscribe(() => {
                this.matDialog.closeAll();
                this.openWaitDialog();
            }),
        );
        this.subscriptionMap.set(
            'lobbyAlertSubscription',
            this.lobbyService.lobbyAlertObservable.subscribe((message: string) => {
                this.matDialog.closeAll();
                this.openAlertDialog(message);
            }),
        );
    }

    ngOnDestroy(): void {
        this.lobbyService.leaveLobby();
        for (const subscription of this.subscriptionMap.values()) {
            subscription.unsubscribe();
        }
    }

    openConstantDialog(): void {
        this.matDialog.open(ConstantDialogComponent, { disableClose: true, panelClass: 'my-dialog' });
    }

    openTrashDialog(): void {
        this.matDialog.open(ConfirmationTrashDialogComponent, { disableClose: true, panelClass: 'my-dialog' });
    }

    openResetAllDialogComponent(games: PublicGame[]) {
        this.matDialog.open(ResetAllDialogComponent, { disableClose: true, data: games, panelClass: 'my-dialog' });
    }

    openScoreResetDialog(currentGame: PublicGame): void {
        this.matDialog.open(ScoreResetDialogComponent, { disableClose: true, data: currentGame, panelClass: 'my-dialog' });
    }

    openRequestDialog(joinRequest: PlayerRequest): void {
        this.matDialog.open(RequestDialogComponent, { disableClose: true, data: joinRequest });
    }

    openDeleteConfirmationDialog(currentGame: PublicGame): void {
        this.matDialog.open(ConfirmationDialogComponent, {
            disableClose: true,
            data: currentGame,
            panelClass: 'my-dialog',
        });
    }

    openWaitDialog(): void {
        this.matDialog.open(WaitDialogComponent, { disableClose: true, panelClass: 'my-dialog' });
    }

    openAlertDialog(message: string): void {
        this.matDialog.open(AlertDialogComponent, { disableClose: true, data: message, panelClass: 'my-dialog' });
    }

    openPlayerNameDialog(): MatDialogRef<PlayerNameDialogComponent> {
        const dialogRef = this.matDialog.open(PlayerNameDialogComponent, {
            disableClose: true,
            panelClass: 'my-dialog',
            data: {
                mode: 'classic',
            },
        });

        return dialogRef;
    }

    async getGames(): Promise<void> {
        await this.gameCardManagerService
            .getGamesAtIndex(this.currentGameIndex)
            .then((games: GameCardInfo) => {
                this.games = games.listOfGames;
                this.isNextButtonEnabled = games.isThereMoreGames;
            })
            .catch((error: Error) => {
                window.alert(error);
            });
    }

    onPreviousClick(): void {
        this.currentGameIndex -= MAX_NUMBER_CARDS_PER_PAGE;
        this.getGames();
    }

    onNextClick(): void {
        this.currentGameIndex += MAX_NUMBER_CARDS_PER_PAGE;
        this.getGames();
    }

    createLobby(currentGameId: string): void {
        const dialogRef = this.openPlayerNameDialog();

        dialogRef.afterClosed().subscribe((name: string) => {
            if (!name) return;
            this.lobbyService.createLobby({ gameId: currentGameId, playerName: name });
            this.openWaitDialog();
        });
    }

    joinLobby(currentGameId: string): void {
        const dialogRef = this.openPlayerNameDialog();

        dialogRef.afterClosed().subscribe((name: string) => {
            if (!name) return;
            this.lobbyService.joinLobby({ gameId: currentGameId, playerName: name });
            this.openWaitDialog();
        });
    }

    startSolo(currentGameId: string): void {
        const dialogRef = this.openPlayerNameDialog();

        dialogRef.afterClosed().subscribe((name: string) => {
            if (!name) return;
            this.lobbyService.startSoloGame({ gameId: currentGameId, playerName: name });
            this.router.navigateByUrl(GAME_PAGE_PATH);
        });
    }
}
