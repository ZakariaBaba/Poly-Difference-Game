/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { CONGRATULATION_MESSAGE, GameMessages, LOSER_MESSAGE, WINNER_MESSAGE } from '@app/constants/constant-server';
import { ChatService } from '@app/services/chat/chat.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { ScoreService } from '@app/services/score/score.service';
import { GameMode, GameType } from '@common/constants';
import { ChatEvents } from '@common/events/chat.events';
import { DifferencesEvents } from '@common/events/differences.events';
import { GameEvents } from '@common/events/game.events';
import { LobbyEvents } from '@common/events/lobby.events';
import { TimerEvents } from '@common/events/timer.events';
import { Coordinates } from '@common/interfaces/coordinates';
import { Difference } from '@common/interfaces/difference';
import { Message, MessageType } from '@common/interfaces/message';
import { Test, TestingModule } from '@nestjs/testing';
import { Subject } from 'rxjs';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { GameGateway } from './game.gateway';

describe('GameGateway', () => {
    let gateway: GameGateway;
    let gameManagerService: SinonStubbedInstance<GameManagerService>;
    let scoreManagerService: SinonStubbedInstance<ScoreService>;
    let chatService: SinonStubbedInstance<ChatService>;
    let server: SinonStubbedInstance<Server>;
    let socket: SinonStubbedInstance<Socket>;
    let timerSource: Subject<number>;
    beforeEach(async () => {
        gameManagerService = createStubInstance(GameManagerService);
        scoreManagerService = createStubInstance(ScoreService);
        chatService = createStubInstance(ChatService);
        server = createStubInstance<Server>(Server);
        socket = createStubInstance<Socket>(Socket);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameGateway,
                {
                    provide: GameManagerService,
                    useValue: gameManagerService,
                },
                {
                    provide: ScoreService,
                    useValue: scoreManagerService,
                },
                {
                    provide: ChatService,
                    useValue: chatService,
                },
            ],
        }).compile();
        gateway = module.get<GameGateway>(GameGateway);
        gateway['server'] = server;
        timerSource = new Subject<number>();
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
    it('leaveGameRoutine should emit gameFinished and call stop', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);
        gameManagerService.getGameType.returns(GameType.Multiplayer);
        gateway['leaveGameRoutine']('1', '1');
        expect(socket.emit.calledWith(GameEvents.GameFinished, 'Votre adversaire a quitté la partie'));
    });

    it('emitDifferenceMessage should emit a message to the room', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);
        const messageContent = 'eljbd';
        const playerName = 'few';
        const messageGame = {
            errorDifference: 'Erreur',
            differenceFound: 'Différence trouvée',
            playerLeft: 'a abandonné la partie',
        } as unknown as GameMessages;
        const message = {
            content: `${messageContent} par ${playerName}`,
            time: new Date().toLocaleTimeString('it-IT'),
            type: MessageType.System,
        } as Message;
        gameManagerService.getPlayerName.returns('few');
        gateway['emitDifferenceMessage']('1', messageGame);
        expect(socket.emit.calledWith(ChatEvents.MESSAGE_CLIENT, message));
    });

    it('should emit differenceFound and call endGameRoutine', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);
        const roomId = '2';
        const difference: Difference = { pixelsPosition: [{ x: 1, y: 0 }] };
        // eslint-disable-next-line prettier/prettier, @typescript-eslint/no-explicit-any
        const spy = jest.spyOn<any, any>(gateway, 'endGameRoutine');
        gameManagerService.getIsFinished.returns(true);
        gateway['foundDifferenceRoutine'](difference, roomId);
        expect(socket.emit.calledWith(DifferencesEvents.DifferenceFound, difference));
        expect(spy).toHaveBeenCalled();
    });

    it('should emit GameStatus', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.checkGameStatus(socket);
        expect(socket.emit.calledWith(GameEvents.GameStatus, gameManagerService.getRoomId(socket.id) !== undefined));
    });

    it('should emit GameStatus', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);
        const differences: Difference[] = [{ pixelsPosition: [{ x: 1, y: 0 }] }];
        gameManagerService.getRoomId.returns('1');
        gameManagerService.getAllDifferences.returns(differences);
        gateway.sendAllDifferences(socket);
        expect(socket.emit.calledWith(DifferencesEvents.AllDifferences, differences));
    });

    it('leaveGame should call getRoomId', () => {
        const spy = jest.spyOn(gameManagerService, 'getRoomId');
        gateway.leaveGame(socket);
        expect(spy).toHaveBeenCalled();
    });

    it('leaveGame should call getRoomId and leaveGameRoutine', () => {
        gameManagerService.getRoomId.returns('1');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy1 = jest.spyOn<any, any>(gateway, 'leaveGameRoutine');
        const spyGetRoomId = jest.spyOn(gameManagerService, 'getRoomId');
        gateway.leaveGame(socket);
        expect(spy1).toHaveBeenCalled();
        expect(spyGetRoomId).toHaveBeenCalled();
    });
    it('validate should validate coordinates', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);
        const testCoordinates: Coordinates = { x: 0, y: 0 };
        gameManagerService.validateDifference.returns(undefined);
        gateway.validate(socket, testCoordinates);
        expect(gameManagerService.validateDifference.calledWith(socket.id, testCoordinates));
        expect(socket.emit.calledWith(DifferencesEvents.ErrorDifference));
        const testDifference: Difference = { pixelsPosition: [{ x: 1, y: 2 }] };
        gameManagerService.validateDifference.returns(testDifference);
        gameManagerService.getDifferenceCount.returns({ total: 1, host: 1, guest: 0 });
        gateway.validate(socket, testCoordinates);
        expect(socket.emit.calledWith(DifferencesEvents.DifferenceFound, testDifference));
        expect(socket.emit.calledWith(DifferencesEvents.DifferenceCount, 1));
    });

    it('emitTimer should send the value of the timer ', () => {
        const testRoomId = '1';
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                expect(event).toEqual(TimerEvents.Timer);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway['emitTimer'](testRoomId, 9);
        expect(socket.emit.calledWith(TimerEvents.Timer, 9));
    });

    it('setTimerEvents should send timerEvents and GameEvents', () => {
        socket.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);

        jest.spyOn(gameManagerService, 'getRoomId').mockReturnValue('1');
        jest.spyOn(gameManagerService, 'getTimerInitialValue').mockReturnValue(10);
        jest.spyOn(gameManagerService, 'getGameConstants').mockReturnValue({ totalTime: 10, timeWon: 10, penalty: 10 });
        jest.spyOn(gameManagerService, 'getTimerObservable').mockReturnValue(timerSource.asObservable());

        gateway.setTimerEvents(socket);
        expect(socket.emit.calledWith(TimerEvents.Timer));
        expect(socket.emit.calledWith(GameEvents.Constant));
    });

    it('getHints should send hints', () => {
        socket.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);

        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);

        jest.spyOn(gameManagerService, 'getRoomId').mockReturnValue('1');
        jest.spyOn(gameManagerService, 'getHint').mockReturnValue({ x: 1, y: 1 });

        gateway.getHint(socket);
        expect(server.emit.calledWith(ChatEvents.MESSAGE_CLIENT));
        expect(socket.emit.calledWith(DifferencesEvents.ReturnHint));
    });

    it('continue soloGame should call startCountdown and emit Game.Events', () => {
        socket.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);

        jest.spyOn(gameManagerService, 'getRoomId').mockReturnValue('1');
        const startCountdown = jest.spyOn(gameManagerService, 'startCountdown');

        gateway.continueSolo(socket);
        expect(server.emit.calledWith(GameEvents.GameInfo));
        expect(socket.emit.calledWith(GameEvents.PlayerNames));
        expect(startCountdown).toHaveBeenCalled();
    });

    it('handleDisconnect should leave the game and emit GameFinished for Classic mode', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);

        jest.spyOn(gameManagerService, 'getRoomId').mockReturnValue('1');
        jest.spyOn(gameManagerService, 'getGameType').mockReturnValue(GameType.Multiplayer);
        jest.spyOn(gameManagerService, 'getIsFinished').mockReturnValue(false);
        jest.spyOn(gameManagerService, 'getGameMode').mockReturnValue(GameMode.Classic);
        const stopTimer = jest.spyOn(gameManagerService, 'stopTimer');
        const deleteGame = jest.spyOn(gameManagerService, 'deleteGame');

        gateway.handleDisconnect(socket);
        expect(server.emit.calledWith(GameEvents.GameFinished));
        expect(stopTimer).toHaveBeenCalled();
        expect(deleteGame).toHaveBeenCalled();

        const removePlayer = jest.spyOn(gameManagerService, 'removePlayer');
        jest.spyOn(gameManagerService, 'getGameMode').mockReturnValue(GameMode.Sprint);

        gateway.handleDisconnect(socket);
        expect(server.emit.calledWith(GameEvents.PlayerLeft));
        expect(stopTimer).toHaveBeenCalled();
        expect(removePlayer).toHaveBeenCalled();
    });

    it('validateSprint should send differenceFound if difference is not undefined', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);

        jest.spyOn(gameManagerService, 'getRoomId').mockReturnValue('1');
        jest.spyOn(gameManagerService, 'validateSprintDifference').mockReturnValue({
            difference: { pixelsPosition: [{ x: 1, y: 1 }] },
            gameId: undefined,
        });
        jest.spyOn(gameManagerService, 'getPlayerName').mockReturnValue('true');
        jest.spyOn(gameManagerService, 'getIsFinished').mockReturnValue(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const endGame = jest.spyOn<any, any>(gateway, 'endGameRoutine');

        gateway['validateSprint'](socket, { x: 1, y: 1 }, '1');

        expect(server.emit.calledWith(DifferencesEvents.DifferenceFound));
        expect(server.emit.calledWith(DifferencesEvents.DifferenceCount));
        expect(server.emit.calledWith(ChatEvents.MESSAGE_CLIENT));
        expect(endGame).toHaveBeenCalled();
    });

    it('validateSprint should switch the game', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);

        jest.spyOn(gameManagerService, 'getRoomId').mockReturnValue('1');
        jest.spyOn(gameManagerService, 'validateSprintDifference').mockReturnValue({
            difference: { pixelsPosition: [{ x: 1, y: 1 }] },
            gameId: 'undefined',
        });
        jest.spyOn(gameManagerService, 'getPlayerName').mockReturnValue('true');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const endGame = jest.spyOn<any, any>(gateway, 'endGameRoutine');

        gateway['validateSprint'](socket, { x: 1, y: 1 }, '1');

        expect(server.emit.calledWith(GameEvents.GameSwitch));
        expect(server.emit.calledWith(DifferencesEvents.DifferenceFound));
        expect(server.emit.calledWith(DifferencesEvents.DifferenceCount));

        expect(endGame).not.toHaveBeenCalled();
    });

    it('validateSprint should send error if difference is undefined', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);

        jest.spyOn(gameManagerService, 'getRoomId').mockReturnValue('1');
        jest.spyOn(gameManagerService, 'validateSprintDifference').mockReturnValue({
            difference: undefined,
            gameId: 'undefined',
        });
        jest.spyOn(gameManagerService, 'getPlayerName').mockReturnValue('true');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any

        gateway['validateSprint'](socket, { x: 1, y: 1 }, '1');

        expect(server.emit.calledWith(DifferencesEvents.ErrorDifference));
        expect(server.emit.calledWith(ChatEvents.MESSAGE_CLIENT));
    });

    it('EndGameRoutine should save the game score en send it to the player in classic mode', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);
        const stopTimer = jest.spyOn(gameManagerService, 'stopTimer');
        jest.spyOn(gameManagerService, 'getGameMode').mockReturnValue(GameMode.Classic);
        jest.spyOn(scoreManagerService, 'endGameRoutine').mockResolvedValue({
            gameType: GameType.Solo,
            gameId: '1',
            gameName: '1',
            score: { playerName: 'name', timeInSeconds: 1, formattedTime: '1' },
            position: 1,
        });
        gateway['endGameRoutine']('1');
        expect(stopTimer).toHaveBeenCalled();
        expect(server.emit.calledWith(LobbyEvents.StatusChanged));
        expect(server.emit.calledWith(ChatEvents.MESSAGE_CLIENT));
        expect(server.emit.calledWith(GameEvents.GameFinished));
    });

    it('EndGameRoutine should save the game score en send it to the player in classic mode and send messsage to winner and loser', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);
        const stopTimer = jest.spyOn(gameManagerService, 'stopTimer');
        jest.spyOn(gameManagerService, 'getGameMode').mockReturnValue(GameMode.Classic);
        jest.spyOn(scoreManagerService, 'endGameRoutine').mockRejectedValue({
            gameType: GameType.Solo,
            gameId: '1',
            gameName: '1',
            score: { playerName: 'name', timeInSeconds: 1, formattedTime: '1' },
            position: 1,
        });
        jest.spyOn(gameManagerService, 'getGameType').mockReturnValue(GameType.Multiplayer);
        gateway['endGameRoutine']('1');
        expect(stopTimer).toHaveBeenCalled();
        expect(server.emit.calledWith(LobbyEvents.StatusChanged));
        expect(server.emit.calledWith(ChatEvents.MESSAGE_CLIENT));
        expect(server.emit.calledWith(GameEvents.GameFinished, WINNER_MESSAGE));
        expect(server.emit.calledWith(GameEvents.GameFinished, LOSER_MESSAGE));
    });

    it('EndGameRoutine not save the score for a sprintGame but still send the message to the player', () => {
        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);
        const stopTimer = jest.spyOn(gameManagerService, 'stopTimer');
        jest.spyOn(gameManagerService, 'getGameMode').mockReturnValue(GameMode.Sprint);
        const endGame = jest.spyOn(scoreManagerService, 'endGameRoutine');

        gateway['endGameRoutine']('1');
        expect(stopTimer).toHaveBeenCalled();
        expect(endGame).not.toHaveBeenCalled();
        expect(server.emit.calledWith(GameEvents.GameFinished, CONGRATULATION_MESSAGE));
    });

    it('timerEndRoutine should call stopTimer and emit to the player', () => {
        socket.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);
        const stopTimer = jest.spyOn(gameManagerService, 'stopTimer');

        gateway['timerEndRoutine'](socket, '1');
        expect(stopTimer).toHaveBeenCalled();
        expect(server.emit.calledWith(GameEvents.GameFinished, CONGRATULATION_MESSAGE));
    });
});
