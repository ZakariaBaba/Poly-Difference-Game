import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EndGameDialogComponent } from '@app/components/end-game-dialog/end-game-dialog.component';
import { LeaveConfirmationDialogComponent } from '@app/components/leave-confirmation-dialog/leave-confirmation-dialog.component';
import { PlayerLeftDialogComponent } from '@app/components/player-left-dialog/player-left-dialog.component';
import { GAME_DOES_NOT_EXIST, HOME_PAGE_PATH, ONE_SECOND_IN_MS, PlayerLeftOptions } from '@app/constants/constant';
import { DifferencesService } from '@app/services/differences/differences.service';
import { EventHandlerService } from '@app/services/event-handler/event-handler.service';
import { GameCommunicationService } from '@app/services/game-communication/game-communication.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { GameType } from '@common/constants';
import { DifferencesCount } from '@common/interfaces/differences-count';
import { GameInfo } from '@common/interfaces/game-info';
import { ConstantParameter, PublicGame } from '@common/interfaces/public-game';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
const baseHints = 3;
@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    animations: [
        trigger('fadeSlideInOut', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(10px)' }),
                animate('500ms', style({ opacity: 1, transform: 'translateY(0)' })),
            ]),
            transition(':leave', [animate('500ms', style({ opacity: 0, transform: 'translateY(10px)' }))]),
        ]),
    ],
})
export class GamePageComponent implements OnInit, OnDestroy {
    hostName: string = '';
    guestName: string = '';
    differenceCount: DifferencesCount;
    maxDifferences: number;
    winCondition: number;
    currentRoute: string;
    originalImage: string;
    modifiedImage: string;
    game: PublicGame;
    mode: string;
    type: string;

    hints: number;
    isHintUsed: boolean;
    isDifferenceFound: boolean;
    hasHint: boolean;
    penalty: number;
    timeBonus: number;

    routeSubscription: Subscription;
    gameCreatedSubscription: Subscription;
    gameInfoSubscription: Subscription;
    gameConstantsSubscription: Subscription;
    differenceCountSubscription: Subscription;
    gameSwitchSubscription: Subscription;
    hintSubscription: Subscription;
    playerNamesSubscription: Subscription;
    endGameSubscription: Subscription;
    playerLeftSubscription: Subscription;

    // eslint-disable-next-line max-params
    constructor(
        private gameManagerService: GameManagerService,
        private matDialog: MatDialog,
        private router: Router,
        private gameCommunicationService: GameCommunicationService,
        private eventHandler: EventHandlerService,
        private differencesService: DifferencesService,
    ) {}

    ngOnInit(): void {
        this.setReloadRoutine();
        this.gameManagerService.initialize();
        this.setGameEvents();
        this.checkGameStatus();
        this.setDifferenceCount();
        this.setPlayerNames();
        this.endGameEvents();
    }

    ngOnDestroy(): void {
        sessionStorage.clear();
        this.gameCreatedSubscription.unsubscribe();
        this.differenceCountSubscription.unsubscribe();
        this.playerNamesSubscription.unsubscribe();
        this.endGameSubscription.unsubscribe();
        this.gameInfoSubscription.unsubscribe();
        this.gameConstantsSubscription.unsubscribe();
        this.gameSwitchSubscription.unsubscribe();
        this.hintSubscription.unsubscribe();
        this.playerLeftSubscription.unsubscribe();
        this.gameManagerService.disconnect();
    }

    setHints(number: number) {
        this.hints = number;
        this.hasHint = true;
    }

    getHint() {
        this.eventHandler.onHintButton();
    }

    getWinCondition(): number {
        const winCondition = this.type === GameType.Solo ? this.maxDifferences : Math.round(this.maxDifferences / 2);
        return winCondition;
    }

    openLeaveConfirmationDialog(): void {
        this.matDialog.open(LeaveConfirmationDialogComponent);
    }

    private setGameView(gameId: string): void {
        this.gameCommunicationService.getGameInfo(gameId).subscribe((game) => {
            this.originalImage = environment.serverUrl + game.originalSource;
            this.modifiedImage = environment.serverUrl + game.modifiedSource;
            this.maxDifferences = game.numberOfDifference;
            this.differenceCount = { total: 0, host: 0, guest: 0 };
            this.game = game;
        });
    }
    private checkGameStatus(): void {
        this.gameCreatedSubscription = this.gameManagerService.gameCreatedObservable.subscribe((isGameCreated: boolean) => {
            if (!isGameCreated) {
                this.openEndGameDialog(GAME_DOES_NOT_EXIST);
            }
        });
    }

    private setGameEvents(): void {
        this.gameInfoSubscription = this.gameManagerService.gameInfoObservable.subscribe((gameInfo: GameInfo) => {
            if (gameInfo.gameId) this.setGameView(gameInfo.gameId);
            this.mode = gameInfo.mode;
            this.type = gameInfo.type;
            this.hasHint = this.type === GameType.Solo;
            if (this.hasHint) {
                this.setHints(baseHints);
            }
        });

        this.gameConstantsSubscription = this.gameManagerService.gameConstantsObservable.subscribe((gameConstants: ConstantParameter) => {
            this.penalty = gameConstants.penalty;
            this.timeBonus = gameConstants.timeWon;
        });

        this.gameSwitchSubscription = this.differencesService.gameSwitchObservable.subscribe(() => {
            this.isDifferenceFound = true;
            setTimeout(() => {
                this.isDifferenceFound = false;
            }, ONE_SECOND_IN_MS);
        });

        this.hintSubscription = this.differencesService.hintObservable.subscribe(() => {
            this.isHintUsed = true;
            setTimeout(() => {
                this.isHintUsed = false;
            }, ONE_SECOND_IN_MS);
        });
    }

    private setDifferenceCount(): void {
        this.differenceCountSubscription = this.gameManagerService.differenceCountObservable.subscribe((count: DifferencesCount) => {
            this.differenceCount = count;
        });
    }

    private endGameEvents(): void {
        this.endGameSubscription = this.gameManagerService.endGameMessageObservable.subscribe((endGameMessage: string) => {
            this.openEndGameDialog(endGameMessage);
        });
        this.playerLeftSubscription = this.gameManagerService.playerLeftObservable.subscribe((playerLeftMessage: string) => {
            this.openPlayerLeftDialog(playerLeftMessage);
        });
    }
    private setPlayerNames(): void {
        this.playerNamesSubscription = this.gameManagerService.playerNamesObservable.subscribe((playerNames: [string, string]) => {
            this.hostName = playerNames[0];
            this.guestName = playerNames[1];
        });
    }

    private openEndGameDialog(message: string): void {
        this.matDialog.open(EndGameDialogComponent, { disableClose: true, data: message });
    }

    private openPlayerLeftDialog(message: string): void {
        const dialogRef = this.matDialog.open(PlayerLeftDialogComponent, {
            disableClose: true,
            data: message,
        });

        dialogRef.afterClosed().subscribe((playerLeftOption: PlayerLeftOptions) => {
            switch (playerLeftOption) {
                case PlayerLeftOptions.ContinueSolo:
                    this.gameManagerService.continueSolo();
                    break;
                case PlayerLeftOptions.Leave:
                    this.router.navigateByUrl(HOME_PAGE_PATH);
            }
        });
    }

    private setReloadRoutine(): void {
        if (sessionStorage.getItem('firstVisit')) {
            this.router.navigateByUrl(HOME_PAGE_PATH);
        }
        sessionStorage.setItem('firstVisit', 'true');
    }
}
