import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PlayerNameDialogComponent } from '@app/components/player-name-dialog/player-name-dialog.component';
import { WaitDialogComponent } from '@app/components/wait-dialog/wait-dialog.component';
import { GAME_PAGE_PATH } from '@app/constants/constant';
import { GameCardManagerService } from '@app/services/game-card-manager/game-card-manager.service';

import { LobbyService } from '@app/services/lobby/lobby.service';
import { GameType } from '@common/constants';
import { PlayerRequest } from '@common/interfaces/player-request';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit, OnDestroy {
    private waitSubscription: Subscription;
    private gameCreatedSubscription: Subscription;

    // eslint-disable-next-line max-params
    constructor(
        private matDialog: MatDialog,
        private router: Router,
        private lobbyService: LobbyService,
        private gameCardManagerService: GameCardManagerService,
    ) {}

    ngOnInit(): void {
        this.lobbyService.initialize();
        this.setSubscriptions();
    }

    ngOnDestroy(): void {
        this.waitSubscription.unsubscribe();
        this.gameCreatedSubscription.unsubscribe();
    }

    setSubscriptions(): void {
        this.waitSubscription = this.lobbyService.waitObservable.subscribe(() => {
            this.matDialog.closeAll();
            this.openWaitDialog();
        });

        this.gameCreatedSubscription = this.lobbyService.gameCreatedObservable.subscribe(() => {
            this.matDialog.closeAll();
            this.router.navigateByUrl(GAME_PAGE_PATH);
        });
    }

    async startSprint(): Promise<void> {
        const existingGames = await this.existingGames();
        if (!existingGames) {
            this.openNoGamesDialog();
            return;
        }

        const dialogRef = this.openSprintPlayerNameDialog();

        dialogRef.afterClosed().subscribe((info: PlayerRequest) => {
            if (!info) return;
            if (info.type === GameType.Multiplayer) {
                this.createSprintLobby(info.playerName);
            } else {
                this.startSoloSprintGame(info.playerName);
                this.router.navigateByUrl(GAME_PAGE_PATH);
            }
        });
    }

    createSprintLobby(name: string): void {
        this.lobbyService.createSprintLobby(name);
    }

    startSoloSprintGame(name: string): void {
        this.lobbyService.startSoloSprintGame(name);
    }

    openWaitDialog(): void {
        this.matDialog.open(WaitDialogComponent, { disableClose: true, panelClass: 'my-dialog' });
    }

    openSprintPlayerNameDialog(): MatDialogRef<PlayerNameDialogComponent> {
        const dialogRef = this.matDialog.open(PlayerNameDialogComponent, {
            disableClose: true,
            panelClass: 'my-dialog',
            data: {
                mode: 'sprint',
            },
        });

        return dialogRef;
    }

    openNoGamesDialog(): void {
        window.alert("Il n'y a aucun jeu existant.");
    }

    private async existingGames(): Promise<boolean> {
        return (await this.gameCardManagerService.getGamesAtIndex(0)).listOfGames.length > 0;
    }
}
