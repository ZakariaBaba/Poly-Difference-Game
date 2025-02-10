/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TIMER_MAX_VALUE } from '@app/constants/constant-server';
import { Observable } from 'rxjs';
import { Timer } from './timer';

describe('Timer', () => {
    let timerInstance: Timer;
    let clock: typeof jest;

    beforeEach(() => {
        timerInstance = new Timer();
        timerInstance['timer'] = 0;
        clock = jest.useFakeTimers();
    });

    it('should be defined', () => {
        expect(timerInstance).toBeDefined();
    });

    it('getTimerObservable() should return the formatted timer', () => {
        expect(timerInstance.timerObservable).toBeInstanceOf(Observable);
    });

    it('start() should start the timer', () => {
        clock.advanceTimersByTime(2000);
        timerInstance.start();
        clock.advanceTimersByTime(2000);
        timerInstance.stop();
        expect(timerInstance['timer']).toEqual(2);
    });

    it('stop() should stop the timer', () => {
        timerInstance.start();
        clock.advanceTimersByTime(6000);
        timerInstance.stop();
        clock.advanceTimersByTime(1000);
        expect(timerInstance['timer']).toEqual(6);
    });

    it('getTimeInSeconds() should return the timer value', () => {
        timerInstance['timer'] = 5;
        expect(timerInstance.getTimeInSeconds()).toEqual(5);
    });

    it('setTimerInitialValue() should set the timer value', () => {
        timerInstance.setTimerInitialValue(5);
        expect(timerInstance['timer']).toEqual(5);
    });

    it('incrementTimer() should increment the timer value', () => {
        timerInstance['timer'] = 5;
        timerInstance.incrementTimer(5);
        expect(timerInstance['timer']).toEqual(10);
    });

    it('decrementTimer() should decrement the timer value', () => {
        timerInstance['timer'] = 5;
        timerInstance.decrementTimer(5);
        expect(timerInstance['timer']).toEqual(0);
    });

    it('decrementTimer() should not decrement the timer value if it is already 0', () => {
        timerInstance['timer'] = 0;
        timerInstance.decrementTimer(5);
        expect(timerInstance['timer']).toEqual(0);
    });

    it('checkTimerLimit() should not change the timer value if it is less than the max value', () => {
        timerInstance['timer'] = 5;
        timerInstance.checkTimerLimit();
        expect(timerInstance['timer']).toEqual(5);
    });

    it('checkTimerLimit() should change the timer value if it is greater than the max value', () => {
        timerInstance['timer'] = 121;
        timerInstance.checkTimerLimit();
        expect(timerInstance['timer']).toEqual(TIMER_MAX_VALUE);
    });

    it('isZero() should return true if the timer value is 0', () => {
        timerInstance['timer'] = 0;
        expect(timerInstance.isZero()).toEqual(true);
    });

    it('isZero() should return false if the timer value is not 0', () => {
        timerInstance['timer'] = 5;
        expect(timerInstance.isZero()).toEqual(false);
    });
});
