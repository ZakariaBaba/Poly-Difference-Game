import { TimerService } from '@app/services/timer/timer.service';
import { GameEvents } from '@common/events/game.events';
import { TimerEvents } from '@common/events/timer.events';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class TimerGateway {
    constructor(private timerService: TimerService) {}

    @SubscribeMessage(TimerEvents.Timer)
    emitTimer(socket: Socket, timer: string) {
        socket.emit(TimerEvents.Timer, timer);
    }

    @SubscribeMessage(TimerEvents.StartTimer)
    startGameTimer(socket: Socket) {
        this.timerService.start(socket.id);
        this.timerService.getTimerObservable(socket.id).subscribe((timer: string) => this.emitTimer(socket, timer));
    }

    @SubscribeMessage(TimerEvents.StopTimer)
    stopGameTimer(socket: Socket) {
        this.timerService.stop(socket.id);
    }

    @SubscribeMessage(GameEvents.CreateGame)
    initTimer(socket: Socket) {
        this.timerService.init(socket.id);
        socket.emit(TimerEvents.Timer, '00:00');
    }

    handleDisconnect(socket: Socket) {
        this.timerService.deleteTimer(socket.id);
    }
}
