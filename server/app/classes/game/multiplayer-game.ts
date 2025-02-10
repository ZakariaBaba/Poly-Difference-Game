import { Game } from '@app/classes/game/game';
import { CLASSIC_TIMER_INITIAL_VALUE, NB_PLAYERS } from '@app/constants/constant-server';
import { EndGameResult } from '@app/interfaces/end-game-result';
import { GameInit } from '@app/interfaces/game-init';
import { Lobby } from '@app/interfaces/lobby';
import { Player } from '@app/interfaces/player';
import { GameMode, GameType } from '@common/constants';
import { Coordinates } from '@common/interfaces/coordinates';
import { Difference } from '@common/interfaces/difference';
import { DifferencesCount } from '@common/interfaces/differences-count';

export class MultiplayerGame extends Game {
    private guest: Player;
    private host: Player;
    private gameId: string;
    private gameName: string;

    constructor(gameInit: GameInit, lobby: Lobby) {
        super(gameInit.differences, gameInit.constants);
        this.gameId = lobby.gameId;
        this.gameName = gameInit.name;
        this.host = lobby.host;
        this.guest = lobby.guest;
    }

    get differencesCount(): DifferencesCount {
        return { total: this.numberOfFoundDifferences, host: this.host.score, guest: this.guest.score };
    }

    get timerInitialValue(): number {
        return CLASSIC_TIMER_INITIAL_VALUE;
    }

    get hostSocketId(): string {
        return this.host.id;
    }

    get guestSocketId(): string {
        return this.guest.id;
    }

    get guestScore(): number {
        return this.guest.score;
    }

    get hostScore(): number {
        return this.host.score;
    }

    get winner(): Player | undefined {
        if (this.isFinished()) {
            return this.host.score > this.guest.score ? this.host : this.guest;
        }
        return undefined;
    }

    get loser(): Player | undefined {
        if (this.isFinished()) {
            return this.host.score > this.guest.score ? this.guest : this.host;
        }
        return undefined;
    }

    getEndGameResult(): EndGameResult {
        return {
            gameType: this.typeOfGame(),
            gameName: this.gameName,
            gameId: this.gameId,
            score: {
                timeInSeconds: this.timer.getTimeInSeconds(),
                playerName: this.winner.name,
            },
        };
    }

    isFinished(): boolean {
        if (this.totalDifferences % 2 === 0) {
            return this.host.score >= this.totalDifferences / NB_PLAYERS || this.guest.score >= this.totalDifferences / NB_PLAYERS;
        }
        return this.guest.score > this.totalDifferences / NB_PLAYERS || this.host.score > this.totalDifferences / NB_PLAYERS;
    }

    validate(coordinates: Coordinates, socketId: string): Difference | undefined {
        for (const [index, difference] of this.differences.entries()) {
            if (this.isInDifference(coordinates, difference)) {
                if (socketId === this.host.id) {
                    this.host.score += 1;
                } else {
                    this.guest.score += 1;
                }
                return this.differences.splice(index, 1)[0];
            }
        }
        return;
    }

    getPlayerName(socketId: string): string {
        return this.host.id === socketId ? this.host.name : this.guest.name;
    }

    typeOfGame(): GameType {
        return GameType.Multiplayer;
    }

    modeOfGame(): GameMode {
        return GameMode.Classic;
    }
}
