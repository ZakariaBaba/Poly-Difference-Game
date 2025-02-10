/* eslint-disable @typescript-eslint/no-magic-numbers */
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

    it('getFormattedTimer() should return the formatted timer', () => {
        timerInstance['timer'] = 600;
        expect(timerInstance.getFormattedTimer()).toEqual('10:00');
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
});
