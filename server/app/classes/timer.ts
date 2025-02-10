import { Observable, Subject } from 'rxjs';

const ONE_SECONDS_IN_MS = 1000;
const MINUTES_INDEX_POSTION = 14;
const SECONDS_INDEX_POSTION = 19;

export class Timer {
    timerObservable: Observable<string>;
    private timer: number = 0;
    private timerInterval: NodeJS.Timer;
    private timerSource = new Subject<string>();

    constructor() {
        this.timerObservable = this.timerSource.asObservable();
    }

    getFormattedTimer() {
        return new Date(this.timer * ONE_SECONDS_IN_MS).toISOString().slice(MINUTES_INDEX_POSTION, SECONDS_INDEX_POSTION);
    }

    start() {
        this.timerInterval = setInterval(() => {
            ++this.timer;
            this.timerSource.next(this.getFormattedTimer());
        }, ONE_SECONDS_IN_MS);
    }

    stop() {
        clearInterval(this.timerInterval);
    }
}
