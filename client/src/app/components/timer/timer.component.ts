import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MINUTES_INDEX_POSITION, ONE_SECOND_IN_MS, SECONDS_INDEX_POSITION } from '@app/constants/constant';
import { TimerService } from '@app/services/timer/timer.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnInit, OnDestroy {
    @Input() gameMode: string;
    timer: number;
    timerServiceSubscription: Subscription;

    constructor(private timerService: TimerService) {}

    get formattedTime() {
        if (this.timer) {
            return new Date(this.timer * ONE_SECOND_IN_MS).toISOString().slice(MINUTES_INDEX_POSITION, SECONDS_INDEX_POSITION);
        }
        return '00:00';
    }

    ngOnInit(): void {
        this.timerServiceSubscription = this.timerService.timerObservable.subscribe((serverTimer: number) => {
            this.timer = serverTimer;
        });
    }

    ngOnDestroy(): void {
        this.timerServiceSubscription.unsubscribe();
    }
}
