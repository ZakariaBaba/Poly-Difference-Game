import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { TimerEvents } from '@common/events/timer.events';
import { Subject } from 'rxjs';
import { Socket } from 'socket.io-client';
import { TimerService } from './timer.service';

describe('TimerService', () => {
    let service: TimerService;
    let socketServiceMock: SocketClientService;
    let socketHelper: SocketTestHelper;

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientService();
        socketServiceMock.socket = socketHelper as unknown as Socket;
        TestBed.configureTestingModule({
            providers: [{ provide: SocketClientService, useValue: socketServiceMock }],
        });
        service = TestBed.inject(TimerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('receiving timer events should update timer', () => {
        const timerSpy = spyOn<Subject<number>>(service['timer$'], 'next').and.callThrough();
        service.listenTimerEvent();
        const emittedTimer = 9;
        socketHelper.peerSideEmit(TimerEvents.Timer, emittedTimer);
        expect(timerSpy).toHaveBeenCalledWith(emittedTimer);
    });
});
