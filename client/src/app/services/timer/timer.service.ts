import { Injectable } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { TimerEvents } from '@common/events/timer.events';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    timerObservable: Observable<number>;
    private timer$ = new Subject<number>();

    constructor(private socketClientService: SocketClientService) {
        this.timerObservable = this.timer$.asObservable();
    }

    listenTimerEvent(): void {
        this.socketClientService.on(TimerEvents.Timer, (timer: number) => {
            this.timer$.next(timer);
        });
    }
}
