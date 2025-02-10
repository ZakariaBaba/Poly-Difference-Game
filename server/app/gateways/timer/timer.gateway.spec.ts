import { TimerService } from '@app/services/timer/timer.service';
import { TimerEvents } from '@common/events/timer.events';
import { Test, TestingModule } from '@nestjs/testing';
import { Subject } from 'rxjs';
import { createStubInstance, match, SinonStubbedInstance } from 'sinon';
import { Socket } from 'socket.io';
import { TimerGateway } from './timer.gateway';

describe('TimerGateway', () => {
    let gateway: TimerGateway;
    let socket: SinonStubbedInstance<Socket>;
    let timerServiceSpy: SinonStubbedInstance<TimerService>;
    let timerSource: Subject<string>;

    beforeEach(async () => {
        socket = createStubInstance<Socket>(Socket);
        timerServiceSpy = createStubInstance<TimerService>(TimerService);
        timerSource = new Subject<string>();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TimerGateway,
                {
                    provide: TimerService,
                    useValue: timerServiceSpy,
                },
            ],
        }).compile();

        gateway = module.get<TimerGateway>(TimerGateway);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('starGameTimer() should start timer and call emit timer when timer changed', () => {
        const testValue = '00:20';
        const spy = jest.spyOn(gateway, 'emitTimer');
        timerServiceSpy.getTimerObservable.returns(timerSource.asObservable());
        gateway.startGameTimer(socket);
        timerSource.next(testValue);
        expect(timerServiceSpy.start.called).toBeTruthy();
        expect(spy).toBeTruthy();
    });

    it('stopGameTimer() should send the timer value to the socket', () => {
        gateway.stopGameTimer(socket);
        expect(timerServiceSpy.stop.called).toBeTruthy();
    });

    it('initTimer() should send the timer value to the socket', () => {
        gateway.initTimer(socket);
        expect(timerServiceSpy.init.called).toBeTruthy();
        expect(socket.emit.calledWith(TimerEvents.Timer, match.any)).toBeTruthy();
    });

    it('handleDisconnect() should call delete timer', () => {
        gateway.handleDisconnect(socket);
        expect(timerServiceSpy.deleteTimer.called).toBeTruthy();
    });
});
