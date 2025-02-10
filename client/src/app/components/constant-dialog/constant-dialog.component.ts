import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAX_PENALTY, MAX_TIME_WON, MIN_TOTAL_TIME, PENALTY, TIME_WON, TOTAL_TIME } from '@app/constants/constant';
import { GameCreationService } from '@app/services/game-creation/game-creation.service';
import { ConstantParameter } from '@common/interfaces/public-game';

@Component({
    selector: 'app-constantdialog',
    templateUrl: './constant-dialog.component.html',
    styleUrls: ['./constant-dialog.component.scss'],
})
export class ConstantDialogComponent implements OnInit {
    totalTimeCheck = new FormControl<string>('', [Validators.minLength(MIN_TOTAL_TIME), Validators.maxLength(TOTAL_TIME)]);
    timeWonCheck = new FormControl<string>('', [Validators.minLength(TIME_WON), Validators.maxLength(MAX_TIME_WON)]);
    penaltyCheck = new FormControl<string>('', [Validators.minLength(PENALTY), Validators.maxLength(MAX_PENALTY)]);
    constantParameter: ConstantParameter;
    totalTime: number = TOTAL_TIME;
    timeWon: number = TIME_WON;
    penalty: number = TOTAL_TIME;

    constructor(private gameCreationService: GameCreationService) {}

    ngOnInit(): void {
        (document.getElementById('total-time') as unknown as HTMLInputElement).placeholder = localStorage.getItem('total-time') || '90';
        (document.getElementById('penalty') as unknown as HTMLInputElement).placeholder = localStorage.getItem('penalty') || '5';
        (document.getElementById('time-won') as unknown as HTMLInputElement).placeholder = localStorage.getItem('time-won') || '5';
    }

    getTotalTime(): number {
        this.totalTime = +(document.getElementById('total-time') as HTMLInputElement).value;

        if (this.totalTime === 0) {
            return (this.totalTime = +(document.getElementById('total-time') as unknown as HTMLInputElement).placeholder);
        }

        return this.totalTime;
    }

    getPenaltyTime(): number {
        this.penalty = +(document.getElementById('penalty') as HTMLInputElement).value;

        if (this.penalty === 0) {
            return (this.penalty = +(document.getElementById('penalty') as unknown as HTMLInputElement).placeholder);
        }

        return this.penalty;
    }

    getTimeWon(): number {
        this.timeWon = +(document.getElementById('time-won') as HTMLInputElement).value;

        if (this.timeWon === 0) {
            return (this.timeWon = +(document.getElementById('time-won') as unknown as HTMLInputElement).placeholder);
        }
        return this.timeWon;
    }

    initTime() {
        this.penalty = PENALTY;
        this.timeWon = TIME_WON;
        this.totalTime = TOTAL_TIME;

        const data: ConstantParameter = {
            totalTime: this.totalTime,
            timeWon: this.timeWon,
            penalty: this.penalty,
        };

        localStorage.setItem('total-time', this.totalTime.toString());
        localStorage.setItem('time-won', this.timeWon.toString());
        localStorage.setItem('penalty', this.penalty.toString());

        this.gameCreationService.setConstantGame(data).subscribe();
    }

    setConstantData(): void {
        if (this.totalTimeCheck.valid) {
            const data: ConstantParameter = {
                totalTime: this.getTotalTime(),
                timeWon: this.getTimeWon(),
                penalty: this.getPenaltyTime(),
            };

            localStorage.setItem('total-time', this.getTotalTime().toString());
            localStorage.setItem('time-won', this.getTimeWon().toString());
            localStorage.setItem('penalty', this.getPenaltyTime().toString());

            this.gameCreationService.setConstantGame(data).subscribe();
        }
    }
}
