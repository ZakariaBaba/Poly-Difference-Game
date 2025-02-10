import { Injectable } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { GameMode } from '@common/constants';
import { GameEvents } from '@common/events/game.events';
import { LobbyEvents } from '@common/events/lobby.events';
import { PlayerRequest } from '@common/interfaces/player-request';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LobbyService {
    statusObservable: Observable<boolean>;
    requestObservable: Observable<PlayerRequest>;
    waitObservable: Observable<boolean>;
    gameCreatedObservable: Observable<boolean>;
    playerLeftObservable: Observable<boolean>;
    lobbyAlertObservable: Observable<string>;

    private statusChanged$: Subject<boolean> = new Subject<boolean>();
    private playerRequest$: Subject<PlayerRequest> = new Subject<PlayerRequest>();
    private wait$: Subject<boolean> = new Subject<boolean>();
    private gameCreated$: Subject<boolean> = new Subject<boolean>();
    private playerLeft$: Subject<boolean> = new Subject<boolean>();
    private lobbyAlert$: Subject<string> = new Subject<string>();

    constructor(private socketClientService: SocketClientService) {
        this.statusObservable = this.statusChanged$.asObservable();
        this.requestObservable = this.playerRequest$.asObservable();
        this.waitObservable = this.wait$.asObservable();
        this.gameCreatedObservable = this.gameCreated$.asObservable();
        this.playerLeftObservable = this.playerLeft$.asObservable();
        this.lobbyAlertObservable = this.lobbyAlert$.asObservable();
    }

    initialize(): void {
        this.connectSocket();
        this.listenLobbyEvent();
    }

    connectSocket(): void {
        if (!this.socketClientService.isSocketAlive()) {
            this.socketClientService.connect();
        }
    }

    listenLobbyEvent(): void {
        this.socketClientService.on(LobbyEvents.StatusChanged, () => {
            this.statusChanged$.next(true);
        });

        this.socketClientService.on(LobbyEvents.RequestToJoin, (joinRequest: PlayerRequest) => {
            this.playerRequest$.next(joinRequest);
        });

        this.socketClientService.on(LobbyEvents.Wait, () => {
            this.wait$.next(true);
        });

        this.socketClientService.on(GameEvents.StartMultiplayerGame, () => {
            this.gameCreated$.next(true);
        });

        this.socketClientService.on(LobbyEvents.Left, () => {
            this.playerLeft$.next(true);
        });

        this.socketClientService.on(LobbyEvents.Alert, (message: string) => {
            this.lobbyAlert$.next(message);
        });
    }

    createLobby(joinRequest: PlayerRequest): void {
        this.socketClientService.send(LobbyEvents.Create, joinRequest);
    }

    createSprintLobby(playerName: string): void {
        this.socketClientService.send(LobbyEvents.CreateMultiplayerSprint, { gameId: GameMode.Sprint, playerName } as PlayerRequest);
    }

    startSoloSprintGame(playerName: string): void {
        this.socketClientService.send(LobbyEvents.CreateSoloSprint, playerName);
    }

    leaveLobby(): void {
        this.socketClientService.send(LobbyEvents.LeaveLobby);
    }

    joinLobby(joinRequest: PlayerRequest): void {
        this.socketClientService.send(LobbyEvents.Join, joinRequest);
    }

    acceptPlayer(gameId: string): void {
        this.socketClientService.send(LobbyEvents.Accepted, gameId);
    }

    rejectPlayer(gameId: string): void {
        this.socketClientService.send(LobbyEvents.Reject, gameId);
    }

    startSoloGame(joinRequest: PlayerRequest): void {
        this.socketClientService.send(LobbyEvents.StartSolo, joinRequest);
    }
}
