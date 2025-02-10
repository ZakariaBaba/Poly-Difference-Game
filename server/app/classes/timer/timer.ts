import { ONE_SECONDS_IN_MS, TIMER_MAX_VALUE } from '@app/constants/constant-server';
import { Observable, Subject } from 'rxjs';

export class Timer {
    timerObservable: Observable<number>;
    private timer: number = 0;
    private timerInterval: NodeJS.Timer;
    private timer$ = new Subject<number>();

    constructor() {
        this.timerObservable = this.timer$.asObservable();
    }

    getTimeInSeconds(): number {
        return this.timer;
    }

    setTimerInitialValue(initialValue: number) {
        this.timer = initialValue;
    }

    startCountdown() {
        this.timerInterval = setInterval(() => {
            --this.timer;
            this.timer$.next(this.timer);
        }, ONE_SECONDS_IN_MS);
    }

    start() {
        this.timerInterval = setInterval(() => {
            ++this.timer;
            this.timer$.next(this.timer);
        }, ONE_SECONDS_IN_MS);
    }

    stop() {
        clearInterval(this.timerInterval);
    }

    incrementTimer(increment: number) {
        this.timer += increment;
    }

    decrementTimer(decrement: number) {
        this.timer -= decrement;
        if (this.timer < 0) {
            this.timer = 0;
        }
        this.timer$.next(this.timer);
    }

    checkTimerLimit(): void {
        if (this.timer > TIMER_MAX_VALUE) {
            this.timer = TIMER_MAX_VALUE;
        }
    }

    isZero(): boolean {
        return this.timer <= 0;
    }
}
