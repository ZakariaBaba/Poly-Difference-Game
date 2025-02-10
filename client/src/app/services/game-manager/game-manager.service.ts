import { Injectable } from '@angular/core';
import { DifferencesService } from '@app/services/differences/differences.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { TimerService } from '@app/services/timer/timer.service';
import { GameEvents } from '@common/events/game.events';
import { DifferencesCount } from '@common/interfaces/differences-count';
import { GameInfo } from '@common/interfaces/game-info';
import { ConstantParameter } from '@common/interfaces/public-game';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameManagerService {
    gameInfoObservable: Observable<GameInfo>;
    gameConstantsObservable: Observable<ConstantParameter>;
    playerNamesObservable: Observable<[string, string]>;
    endGameMessageObservable: Observable<string>;
    gameCreatedObservable: Observable<boolean>;
    playerLeftObservable: Observable<string>;

    private gameInfo$: Subject<GameInfo> = new Subject<GameInfo>();
    private gameConstants$: Subject<ConstantParameter> = new Subject<ConstantParameter>();
    private playerNames$: Subject<[string, string]> = new Subject<[string, string]>();
    private endGameMessage$: Subject<string> = new Subject<string>();
    private gameCreated$: Subject<boolean> = new Subject<boolean>();
    private playerLeft$: Subject<string> = new Subject<string>();

    constructor(private socketClientService: SocketClientService, private differenceService: DifferencesService, private timerService: TimerService) {
        this.gameInfoObservable = this.gameInfo$.asObservable();
        this.gameConstantsObservable = this.gameConstants$.asObservable();
        this.playerNamesObservable = this.playerNames$.asObservable();
        this.endGameMessageObservable = this.endGameMessage$.asObservable();
        this.gameCreatedObservable = this.gameCreated$.asObservable();
        this.playerLeftObservable = this.playerLeft$.asObservable();
    }

    get differenceCountObservable(): Observable<DifferencesCount> {
        return this.differenceService.differenceCountObservable;
    }

    initialize(): void {
        if (this.socketClientService.isSocketAlive()) {
            this.checkGameStatus();
            this.timerService.listenTimerEvent();
            this.differenceService.listenDifferenceEvents();
            this.listenGameEvents();
            this.endGameEvents();
        }
    }

    checkGameStatus(): void {
        this.socketClientService.send(GameEvents.CheckGameStatus);
        this.socketClientService.send(GameEvents.PageLoaded);

        this.socketClientService.on(GameEvents.GameStatus, (isGameCreated: boolean) => {
            this.gameCreated$.next(isGameCreated);
        });
    }

    listenGameEvents(): void {
        this.socketClientService.on(GameEvents.GameInfo, (gameInfo: GameInfo) => {
            this.gameInfo$.next(gameInfo);
        });

        this.socketClientService.on(GameEvents.Constant, (constant: ConstantParameter) => {
            this.gameConstants$.next(constant);
        });

        this.socketClientService.on(GameEvents.PlayerNames, (playerNames: [string, string]) => {
            this.playerNames$.next(playerNames);
        });
    }
    endGameEvents(): void {
        this.socketClientService.on(GameEvents.GameFinished, (endGameMessage: string) => {
            this.endGameMessage$.next(endGameMessage);
        });

        this.socketClientService.on(GameEvents.PlayerLeft, (playerLeftMessage: string) => {
            this.playerLeft$.next(playerLeftMessage);
        });
    }

    leaveGame(): void {
        if (this.socketClientService.isSocketAlive()) {
            this.socketClientService.send(GameEvents.LeaveGame);
        }
    }

    disconnect(): void {
        if (this.socketClientService.isSocketAlive()) {
            this.socketClientService.disconnect();
        }
    }

    continueSolo(): void {
        if (this.socketClientService.isSocketAlive()) {
            this.socketClientService.send(GameEvents.ContinueSolo);
        }
    }
}
