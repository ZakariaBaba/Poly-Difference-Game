import { Timer } from '@app/classes/timer';
import { Test, TestingModule } from '@nestjs/testing';
import { Observable, Subject } from 'rxjs';
import { TimerService } from './timer.service';

describe('TimerService', () => {
    let service: TimerService;
    let testMap: Map<string, Timer>;
    let testSockedId: string;
    let testObservable: Observable<string>;
    let testSource: Subject<string>;

    beforeEach(async () => {
        testMap = new Map<string, Timer>();
        testSockedId = '2aaaa';
        testSource = new Subject<string>();
        testObservable = testSource.asObservable();

        const module: TestingModule = await Test.createTestingModule({
            providers: [TimerService],
        }).compile();

        service = module.get<TimerService>(TimerService);
        service['timerMap'] = testMap;
        service['timerMap'].set(testSockedId, new Timer());
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should init a new timer', () => {
        service.init('asd2asf');
        expect(service['timerMap'].size).toBe(2);
    });

    it('should start the timer specific to the socket', () => {
        const spy = jest.spyOn(service['timerMap'].get(testSockedId), 'start');
        service.start(testSockedId);
        service.stop(testSockedId);
        expect(spy).toHaveBeenCalled();
    });

    it('should stop the timer specific to the socket', () => {
        const spy = jest.spyOn(service['timerMap'].get(testSockedId), 'stop');
        service.stop(testSockedId);
        expect(spy).toHaveBeenCalled();
    });

    it('should return the formatted timer specific to the socket', () => {
        testMap.get(testSockedId)['timer'] = 600;
        expect(service.getformattedTimer(testSockedId)).toEqual('10:00');
    });

    it('should return the timer observable specific to the socket', () => {
        testMap.get(testSockedId).timerObservable = testObservable;
        expect(service.getTimerObservable(testSockedId)).toEqual(testObservable);
    });

    it('should init a new timer', () => {
        service.deleteTimer(testSockedId);
        expect(service['timerMap'].size).toBe(0);
    });
});
