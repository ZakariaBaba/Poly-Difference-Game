import { EndGameResult } from '@app/interfaces/end-game-result';
import { GameInit } from '@app/interfaces/game-init';
import { Lobby } from '@app/interfaces/lobby';
import { Player } from '@app/interfaces/player';
import { GameMode, GameType } from '@common/constants';
import { Coordinates } from '@common/interfaces/coordinates';
import { Difference } from '@common/interfaces/difference';
import { DifferencesCount } from '@common/interfaces/differences-count';

import { Game } from './game';

export class SprintGame extends Game {
    private guest?: Player;
    private host: Player;
    private nbFoundDifferences: number = 0;
    private playedGameId: Set<string> = new Set<string>();
    private noMoreGames: boolean = false;

    // eslint-disable-next-line max-params
    constructor(gameInit: GameInit, lobby: Lobby, gameId: string) {
        super(gameInit.differences, gameInit.constants);
        this.host = lobby.host;
        if (lobby.guest) this.guest = lobby.guest;
        this.playedGameId.add(gameId);
        this.timer.setTimerInitialValue(gameInit.constants.totalTime);
    }

    get differencesCount(): DifferencesCount {
        return { total: this.nbFoundDifferences } as DifferencesCount;
    }

    get hostSocketId(): string {
        return this.host.id;
    }

    get guestSocketId(): string {
        return this.guest.id;
    }

    get timerInitialValue(): number {
        return this.constants.totalTime;
    }

    validate(coordinates: Coordinates): Difference | undefined {
        for (const difference of this.differences) {
            if (this.isInDifference(coordinates, difference)) {
                this.nbFoundDifferences++;
                this.addBonusTime();
                return difference;
            }
        }
        return undefined;
    }

    getEndGameResult(): EndGameResult {
        return {} as EndGameResult;
    }

    isFinished(): boolean {
        return this.timer.isZero() || this.noMoreGames;
    }

    typeOfGame(): GameType {
        return this.guest ? GameType.Multiplayer : GameType.Solo;
    }

    modeOfGame(): GameMode {
        return GameMode.Sprint;
    }

    removePlayer(socketId: string) {
        if (this.guest?.id === socketId) {
            this.guest = undefined;
        } else if (this.host.id === socketId) {
            this.host = JSON.parse(JSON.stringify(this.guest));
            this.guest = undefined;
        }
    }

    chooseNextGame(gamesId: Set<string>): string | undefined {
        const unusedGames = [...gamesId].filter((id: string) => !this.playedGameId.has(id));
        if (unusedGames.length === 0) this.noMoreGames = true;
        return this.randomItem(unusedGames);
    }

    setNextGame(gameId: string, difference: Difference[]): void {
        this.differences = difference;
        this.playedGameId.add(gameId);
    }

    getPlayerName(socketId: string): string {
        return this.host.id === socketId ? this.host.name : this.guest.name;
    }

    getDifferencePixel(): Coordinates {
        this.addTimePenalty();
        return this.randomItem(this.randomItem(this.differences).pixelsPosition);
    }

    private addBonusTime() {
        this.timer.incrementTimer(this.constants.timeWon);
        this.timer.checkTimerLimit();
    }

    private addTimePenalty() {
        this.timer.decrementTimer(this.constants.penalty);
    }
}
