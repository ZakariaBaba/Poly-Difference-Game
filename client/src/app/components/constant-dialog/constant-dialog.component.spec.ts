import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PENALTY, TIME_WON, TOTAL_TIME } from '@app/constants/constant';
import { GameCreationService } from '@app/services/game-creation/game-creation.service';
import { of } from 'rxjs';

import { ConstantDialogComponent } from './constant-dialog.component';
import SpyObj = jasmine.SpyObj;

describe('ConstantDialogComponent', () => {
    let component: ConstantDialogComponent;
    let fixture: ComponentFixture<ConstantDialogComponent>;
    let mockGameCreationServiceSpyObj: SpyObj<GameCreationService>;

    beforeEach(async () => {
        mockGameCreationServiceSpyObj = jasmine.createSpyObj('GameCreationService', ['setConstantGame']);
        mockGameCreationServiceSpyObj.setConstantGame.and.returnValue(of());
        await TestBed.configureTestingModule({
            declarations: [ConstantDialogComponent],
            imports: [HttpClientTestingModule, MatIconModule, ReactiveFormsModule],
            providers: [{ provide: GameCreationService, useValue: mockGameCreationServiceSpyObj }],
        }).compileComponents();

        fixture = TestBed.createComponent(ConstantDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return total time', () => {
        const htmlInputElement = document.getElementById('total-time') as HTMLInputElement;
        htmlInputElement.value = '5';
        const time = component.getTotalTime();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(time).toEqual(5);
    });

    it('should return total time equal 30', () => {
        const htmlInputElement = document.getElementById('total-time') as HTMLInputElement;
        htmlInputElement.value = '0';
        const time = component.getTotalTime();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(time).toEqual(+(document.getElementById('total-time') as unknown as HTMLInputElement).placeholder);
    });

    it('should return penalty', () => {
        const htmlInputElement = document.getElementById('penalty') as HTMLInputElement;
        htmlInputElement.value = '5';
        const time = component.getPenaltyTime();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(time).toEqual(5);
    });

    it('should return penalty equal 5', () => {
        const htmlInputElement = document.getElementById('penalty') as HTMLInputElement;
        htmlInputElement.value = '0';
        const time = component.getPenaltyTime();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(time).toEqual(+(document.getElementById('penalty') as unknown as HTMLInputElement).placeholder);
    });

    it('should return time Won', () => {
        const htmlInputElement = document.getElementById('time-won') as HTMLInputElement;
        htmlInputElement.value = '5';
        const time = component.getTimeWon();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(time).toEqual(5);
    });

    it('should return timeWon equal to 5', () => {
        const htmlInputElement = document.getElementById('time-won') as HTMLInputElement;
        htmlInputElement.value = '0';
        const time = component.getTimeWon();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(time).toEqual(+(document.getElementById('time-won') as unknown as HTMLInputElement).placeholder);
    });

    it('should return initTime', () => {
        component.initTime();
        expect(mockGameCreationServiceSpyObj.setConstantGame).toHaveBeenCalled();
        expect(component.penalty).toEqual(PENALTY);
        expect(component.timeWon).toEqual(TIME_WON);
        expect(component.totalTime).toEqual(TOTAL_TIME);
    });

    it('should return setConstantData', () => {
        component.setConstantData();
        expect(component.totalTime).toEqual(component.getTotalTime());
        expect(component.timeWon).toEqual(component.getTimeWon());
        expect(component.penalty).toEqual(component.getPenaltyTime());
        expect(mockGameCreationServiceSpyObj.setConstantGame).toHaveBeenCalled();
    });
});
