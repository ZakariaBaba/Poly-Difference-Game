import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimerService } from '@app/services/timer/timer.service';
import { Subject } from 'rxjs';
import { TimerComponent } from './timer.component';
import SpyObj = jasmine.SpyObj;

describe('TimerComponent', () => {
    let component: TimerComponent;
    let fixture: ComponentFixture<TimerComponent>;
    let timerServiceSpy: SpyObj<TimerService>;
    let timerSource: Subject<number>;

    beforeEach(async () => {
        timerSource = new Subject<number>();

        timerServiceSpy = jasmine.createSpyObj('TimerService', ['']);
        timerServiceSpy.timerObservable = timerSource.asObservable();
        await TestBed.configureTestingModule({
            declarations: [TimerComponent],
            providers: [{ provide: TimerService, useValue: timerServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(TimerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('modifying subscription source should change timer', () => {
        const testValue = 9;
        timerSource.next(testValue);
        expect(component.timer).toBe(testValue);
    });

    it('formattedTime should return 00:00 if timer is null', () => {
        component.timer = 1;
        expect(component.formattedTime).toBe('00:01');
    });
});
