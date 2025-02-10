import { Timer } from '@app/classes/timer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TimerService {
    private timerMap: Map<string, Timer> = new Map<string, Timer>();

    init(gameId: string) {
        this.timerMap.set(gameId, new Timer());
    }

    start(gameId: string) {
        this.timerMap.get(gameId).start();
    }

    stop(gameId: string) {
        this.timerMap.get(gameId).stop();
    }

    getformattedTimer(gameId: string) {
        return this.timerMap.get(gameId).getFormattedTimer();
    }

    getTimerObservable(gameId: string) {
        return this.timerMap.get(gameId).timerObservable;
    }

    deleteTimer(gameId: string) {
        this.timerMap.delete(gameId);
    }
}
