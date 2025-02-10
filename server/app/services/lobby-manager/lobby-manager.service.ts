import { Lobby } from '@app/interfaces/lobby';
import { Player } from '@app/interfaces/player';
import { PlayerType } from '@app/interfaces/player-type';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { GameMode } from '@common/constants';
import { PlayerRequest } from '@common/interfaces/player-request';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuid } from 'uuid';

@Injectable()
export class LobbyManagerService {
    private lobbies: Map<string, Lobby> = new Map<string, Lobby>();
    constructor(private gameManagerService: GameManagerService) {}

    createLobby(request: PlayerRequest, hostSocketId: string): Lobby {
        const host: Player = {
            id: hostSocketId,
            score: 0,
            name: request.playerName,
            playerType: PlayerType.Host,
        };
        const lobby: Lobby = {
            roomId: uuid(),
            gameId: request.gameId,
            host,
        };
        this.lobbies.set(request.gameId, lobby);
        return lobby;
    }

    isLobbyCreated(gameId: string): boolean {
        return this.lobbies.has(gameId);
    }

    getPlayerNames(gameId: string): [string, string] {
        return [this.getHostPlayer(gameId).name, this.getGuestPlayer(gameId)?.name];
    }

    getRoomId(gameId: string): string | undefined {
        if (this.lobbies.has(gameId)) {
            return this.lobbies.get(gameId).roomId;
        }
        return undefined;
    }

    getGameIdFromPlayerId(playerId: string): string | undefined {
        for (const [gameId, lobby] of this.lobbies) {
            if (lobby.host.id === playerId || lobby.guest?.id === playerId) {
                return gameId;
            }
        }
        return undefined;
    }

    getHostPlayer(gameId: string): Player | undefined {
        if (this.lobbies.has(gameId)) {
            return this.lobbies.get(gameId).host;
        }
        return undefined;
    }

    getGuestPlayer(gameId: string): Player | undefined {
        if (this.lobbies.has(gameId)) {
            return this.lobbies.get(gameId).guest;
        }
        return undefined;
    }

    setGuestPlayer(request: PlayerRequest, guestSocketId: string): void {
        const guest = {
            id: guestSocketId,
            score: 0,
            name: request.playerName,
            playerType: PlayerType.Guest,
        };
        this.lobbies.get(request.gameId).guest = guest;
    }

    removeGuestPlayer(gameId: string): void {
        this.lobbies.get(gameId).guest = undefined;
    }

    deleteLobby(gameId: string): void {
        this.lobbies.delete(gameId);
    }

    createMultiplayerGame(gameId: string): void {
        const lobby = this.lobbies.get(gameId);
        this.gameManagerService.createMultiplayerGame(lobby, gameId);
        this.deleteLobby(gameId);
    }

    createMultiplayerSprintGame(gameId: string): void {
        const lobby = this.lobbies.get(GameMode.Sprint);
        this.gameManagerService.createSprintGame(gameId, lobby);
        this.deleteLobby(GameMode.Sprint);
    }

    createSoloSprintGame(gameId: string, soloLobby: Lobby): void {
        this.gameManagerService.createSprintGame(gameId, soloLobby);
    }

    createSoloGame(soloRequest: PlayerRequest, playerId: string): void {
        this.gameManagerService.createSoloGame(soloRequest, playerId);
    }

    getTimerObservable(roomId: string): Observable<number> {
        return this.gameManagerService.getTimerObservable(roomId);
    }
}
