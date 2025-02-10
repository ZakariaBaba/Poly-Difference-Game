import { Game } from '@app/classes/game/game';
import { MultiplayerGame } from '@app/classes/game/multiplayer-game';
import { SoloGame } from '@app/classes/game/solo-game';
import { SprintGame } from '@app/classes/game/sprint-game';
import { CONSTANT_PATH, ENCODING, JSON_EXT, JSON_PATH, RELATIVE_PATH_TO_DIFFERENCES } from '@app/constants/constant-server';
import { EndGameResult } from '@app/interfaces/end-game-result';
import { Lobby } from '@app/interfaces/lobby';
import { GameDataDto } from '@app/model/dto/game-data.dto';
import { ListGameService } from '@app/services/list-game/list-game.service';
import { GameMode, GameType } from '@common/constants';
import { Coordinates } from '@common/interfaces/coordinates';
import { Difference } from '@common/interfaces/difference';
import { DifferenceValidation } from '@common/interfaces/difference-validation';
import { DifferencesCount } from '@common/interfaces/differences-count';
import { PlayerRequest } from '@common/interfaces/player-request';
import { ConstantParameter } from '@common/interfaces/public-game';
import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';

@Injectable()
export class GameManagerService {
    private gameMap: Map<string, Game> = new Map<string, Game>();
    private socketRooms: Map<string, string> = new Map<string, string>();

    constructor(private listGameService: ListGameService) {}

    createMultiplayerGame(lobby: Lobby, gameCardId: string) {
        this.gameMap.set(
            lobby.roomId,
            new MultiplayerGame(
                {
                    differences: this.readDifferenceFile(gameCardId),
                    constants: this.readConstantsFile(),
                    name: this.getGameName(gameCardId),
                },
                lobby,
            ),
        );
        this.socketRooms.set(lobby.host.id, lobby.roomId);
        this.socketRooms.set(lobby.guest.id, lobby.roomId);
        this.startTimer(lobby.roomId);
    }

    createSprintGame(gameId: string, lobby: Lobby) {
        this.gameMap.set(
            lobby.roomId,
            new SprintGame(
                {
                    differences: this.readDifferenceFile(gameId),
                    constants: this.readConstantsFile(),
                },
                lobby,
                gameId,
            ),
        );
        this.socketRooms.set(lobby.host.id, lobby.roomId);
        if (lobby.guest) this.socketRooms.set(lobby.guest.id, lobby.roomId);
        this.startCountdown(lobby.roomId);
    }

    getRoomId(socketId: string): string | undefined {
        return this.socketRooms.get(socketId);
    }

    getMultiplayerGame(roomId: string): MultiplayerGame | SprintGame | undefined {
        const game: Game = this.gameMap.get(roomId);
        if (game.typeOfGame() === GameType.Solo) {
            return undefined;
        }
        switch (game.modeOfGame()) {
            case GameMode.Classic:
                return game as MultiplayerGame;
            case GameMode.Sprint:
                return game as SprintGame;
        }
    }

    createSoloGame(soloRequest: PlayerRequest, playerId: string) {
        this.gameMap.set(
            playerId,
            new SoloGame(
                {
                    differences: this.readDifferenceFile(soloRequest.gameId),
                    constants: this.readConstantsFile(),
                    name: this.getGameName(soloRequest.gameId),
                },
                soloRequest,
            ),
        );
        this.socketRooms.set(playerId, playerId);
        this.startTimer(playerId);
    }

    deleteGame(roomId: string) {
        this.gameMap.delete(roomId);
    }

    removePlayer(roomId: string, socketId: string) {
        const game = this.gameMap.get(roomId);
        if (game.modeOfGame() === GameMode.Sprint && game.typeOfGame() === GameType.Multiplayer) {
            (game as SprintGame).removePlayer(socketId);
        } else if (game.modeOfGame() === GameMode.Sprint && game.typeOfGame() === GameType.Solo) {
            this.socketRooms.delete(socketId);
            this.deleteGame(roomId);
        }
        this.socketRooms.delete(socketId);
    }

    getGameConstants(roomId: string): ConstantParameter {
        return this.gameMap.get(roomId).gameConstants;
    }

    getDifferenceCount(roomId: string): DifferencesCount {
        return this.gameMap.get(roomId).differencesCount;
    }

    getIsFinished(roomId: string): boolean {
        return this.gameMap.get(roomId).isFinished();
    }

    getWinnerId(roomId: string): string {
        const game: MultiplayerGame = this.gameMap.get(roomId) as MultiplayerGame;
        return game.winner?.id;
    }

    getLoserId(roomId: string): string {
        const game: MultiplayerGame = this.gameMap.get(roomId) as MultiplayerGame;
        return game.loser?.id;
    }

    getGameType(roomId: string): GameType | undefined {
        return this.gameMap.get(roomId)?.typeOfGame();
    }

    getGameMode(roomId: string): GameMode | undefined {
        return this.gameMap.get(roomId)?.modeOfGame();
    }

    validateDifference(roomId: string, clickedCoordinates: Coordinates, socketId: string): Difference | undefined {
        return this.gameMap.get(roomId).validate(clickedCoordinates, socketId);
    }

    validateSprintDifference(roomId: string, clickedCoordinates: Coordinates): DifferenceValidation | undefined {
        const game = this.gameMap.get(roomId) as SprintGame;
        const difference = game.validate(clickedCoordinates);
        if (!difference) {
            return undefined;
        }
        const nextGameId: string = game.chooseNextGame(this.listGameService.getGamesId());
        if (!nextGameId) {
            return { difference, gameId: undefined } as DifferenceValidation;
        }
        game.setNextGame(nextGameId, this.readDifferenceFile(nextGameId));
        return { difference, gameId: nextGameId } as DifferenceValidation;
    }

    getPlayerName(socketId: string): string {
        const game: Game = this.gameMap.get(this.socketRooms.get(socketId));
        if (game.modeOfGame() === GameMode.Sprint) return (game as SprintGame).getPlayerName(socketId);
        else if (game.typeOfGame() === GameType.Multiplayer) return (game as MultiplayerGame).getPlayerName(socketId);
        return undefined;
    }

    getAllDifferences(roomId: string): Difference[] {
        return this.gameMap.get(roomId).allDifferences;
    }

    getEndGameResult(roomId: string): EndGameResult {
        this.stopTimer(roomId);
        return this.gameMap.get(roomId).getEndGameResult();
    }

    getTimerInitialValue(roomId: string): number {
        return this.gameMap.get(roomId).timerInitialValue;
    }

    startCountdown(roomId: string): void {
        this.gameMap.get(roomId).timer.startCountdown();
    }

    stopTimer(roomId: string): void {
        this.gameMap.get(roomId).timer.stop();
    }

    getTimerObservable(roomId: string) {
        return this.gameMap.get(roomId).timer.timerObservable;
    }

    getHint(roomId: string): Coordinates {
        const game = this.gameMap.get(roomId) as SoloGame | SprintGame;
        return game.getDifferencePixel();
    }

    private startTimer(roomId: string): void {
        this.gameMap.get(roomId).timer.start();
    }

    private readDifferenceFile(gameCardId: string): Difference[] {
        return JSON.parse(readFileSync(RELATIVE_PATH_TO_DIFFERENCES + gameCardId + JSON_EXT, ENCODING));
    }

    private readConstantsFile(): ConstantParameter {
        return JSON.parse(readFileSync(CONSTANT_PATH, ENCODING));
    }

    private readGameFile(): GameDataDto[] {
        return JSON.parse(readFileSync(JSON_PATH, ENCODING)).listOfGames;
    }

    private getGameName(gameId: string): string {
        const listOfGames = this.readGameFile();
        return listOfGames.find((game) => game.id === gameId).name;
    }
}
