import { CLASSIC_TIMER_INITIAL_VALUE } from '@app/constants/constant-server';
import { EndGameResult } from '@app/interfaces/end-game-result';
import { GameInit } from '@app/interfaces/game-init';
import { GameMode, GameType } from '@common/constants';
import { Coordinates } from '@common/interfaces/coordinates';
import { Difference } from '@common/interfaces/difference';
import { PlayerRequest } from '@common/interfaces/player-request';
import { Game } from './game';

export class SoloGame extends Game {
    private playerName: string;
    private gameId: string;
    private gameName: string;

    constructor(gameInit: GameInit, soloRequest: PlayerRequest) {
        super(gameInit.differences, gameInit.constants);
        this.gameId = soloRequest.gameId;
        this.gameName = gameInit.name;
        this.playerName = soloRequest.playerName;
    }

    get timerInitialValue(): number {
        return CLASSIC_TIMER_INITIAL_VALUE;
    }

    validate(coordinates: Coordinates): Difference | undefined {
        for (const [index, difference] of this.differences.entries()) {
            if (this.isInDifference(coordinates, difference)) {
                return this.differences.splice(index, 1)[0];
            }
        }
        return;
    }

    getEndGameResult(): EndGameResult {
        return {
            gameType: this.typeOfGame(),
            gameId: this.gameId,
            gameName: this.gameName,
            score: {
                timeInSeconds: this.timer.getTimeInSeconds(),
                playerName: this.playerName,
            },
        };
    }

    isFinished(): boolean {
        return this.differences.length === 0;
    }

    typeOfGame(): GameType {
        return GameType.Solo;
    }

    modeOfGame(): GameMode {
        return GameMode.Classic;
    }

    getDifferencePixel(): Coordinates {
        this.timer.incrementTimer(this.constants.penalty);
        return this.randomItem(this.randomItem(this.differences).pixelsPosition);
    }

    protected randomItem<T>(items: T[]): T {
        return items[Math.floor(Math.random() * items.length)];
    }
}
