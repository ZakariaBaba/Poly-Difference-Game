/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line max-classes-per-file
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { ONE_SECOND_IN_MS, PlayerLeftOptions } from '@app/constants/constant';
import { DifferencesService } from '@app/services/differences/differences.service';
import { EventHandlerService } from '@app/services/event-handler/event-handler.service';
import { GameCommunicationService } from '@app/services/game-communication/game-communication.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { GameMode, GameType } from '@common/constants';
import { GameInfo } from '@common/interfaces/game-info';
import { PublicGame } from '@common/interfaces/public-game';
import { of, Subject } from 'rxjs';
import { GamePageComponent } from './game-page.component';
import SpyObj = jasmine.SpyObj;

const routerStub = {
    url: '/home',
    navigateByUrl: () => {
        return;
    },
};

const gameManagerServiceStub = {
    initialize: () => {
        return;
    },
    listenGameEvents: () => {
        return;
    },
    endGameEvents: () => {
        return;
    },
    leaveGame: () => {
        return;
    },
    disconnect: () => {
        return;
    },
    continueSolo: () => {
        return;
    },
    differenceCountObservable: of({ total: 0, host: 0, guest: 0 }),
    gameInfoObservable: of({}),
    playerNamesObservable: of({}),
    endGameMessageObservable: of({}),
    gameCreatedObservable: of({}),
    gameConstantsObservable: of({}),
    playerLeftObservable: of({}),
};

const differencesServiceStub = {
    gameSwitchObservable: of({}),
    hintObservable: of({}),
};

describe('GamePageComponent', () => {
    const fakeId = 5;
    const fakeGame: PublicGame = {
        originalSource: 'Source1',
        modifiedSource: 'Source2',
        numberOfDifference: 3,
        name: 'tst',
        id: '1',
        isWaiting: false,
    };
    const fakeGameInfo: GameInfo = {
        gameId: '5',
        mode: GameMode.Classic,
        type: GameType.Solo,
    };
    let mockMatDialog: SpyObj<MatDialog>;
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let gameCommunicationServiceSpy: SpyObj<GameCommunicationService>;
    let gameCreatedSource: Subject<boolean>;
    let eventhandler: SpyObj<EventHandlerService>;

    const gameSubject = new Subject<PublicGame>();
    const gameInfoSubject = new Subject<GameInfo>();
    const observableGame = gameSubject.asObservable();
    gameManagerServiceStub.gameInfoObservable = gameInfoSubject.asObservable();

    beforeEach(async () => {
        gameCreatedSource = new Subject<boolean>();
        gameManagerServiceStub.gameCreatedObservable = gameCreatedSource.asObservable();
        mockMatDialog = jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);
        gameCommunicationServiceSpy = jasmine.createSpyObj('GameCommunicationService', ['getGameInfo']);
        eventhandler = jasmine.createSpyObj('EventHandlerService', ['onHintButton']);
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent, PlayAreaComponent, MockTimerComponent, MockChatComponent],
            imports: [MatDialogModule, HttpClientTestingModule],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ id: fakeId }),
                    },
                },
                { provide: GameManagerService, useValue: gameManagerServiceStub },
                { provide: MatDialog, useValue: mockMatDialog },
                { provide: DifferencesService, useValue: differencesServiceStub },
                { provide: GameCommunicationService, useValue: gameCommunicationServiceSpy },
                { provide: Router, useValue: routerStub },
                { provide: EventHandlerService, useValue: eventhandler },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('getWinCondition should return maxDifference in solo', () => {
        component.type = GameType.Solo;
        component.maxDifferences = 5;
        expect(component.getWinCondition()).toEqual(5);
    });

    it('getWinCondition should return half the maxDifference in multiplayer', () => {
        component.type = GameType.Multiplayer;
        component.maxDifferences = 5;
        expect(component.getWinCondition()).toEqual(3);
    });

    it('should receive game from gameCommunicationService observable', () => {
        // this.hasHint = this.type === 'solo' ? true : false;
        gameCommunicationServiceSpy.getGameInfo.and.returnValue(observableGame);
        const spy = spyOn(component, 'setHints');
        component['setGameEvents']();
        gameInfoSubject.next(fakeGameInfo);
        expect(component.mode).toBe(fakeGameInfo.mode);
        expect(component.type).toBe(fakeGameInfo.type);
        expect(spy).toHaveBeenCalled();
    });

    it('should receive game from gameCommunicationService observable', fakeAsync(() => {
        gameCommunicationServiceSpy.getGameInfo.and.returnValue(observableGame);
        component['setGameEvents']();
        gameInfoSubject.next(fakeGameInfo);
        expect(component.isDifferenceFound).toBe(true);
        tick(ONE_SECOND_IN_MS);
        expect(component.isDifferenceFound).toBe(false);
    }));

    it('should receive game from gameCommunicationService observable', () => {
        gameCommunicationServiceSpy.getGameInfo.and.returnValue(observableGame);
        component['setGameView']('5');
        gameSubject.next(fakeGame);
        expect(component.game).toBe(fakeGame);
    });

    it('setReloadRoutine should navigate to another page if it is not the first visit', () => {
        sessionStorage.setItem('firstVisit', 'true');
        const spy = spyOn(routerStub, 'navigateByUrl');
        component['setReloadRoutine']();
        expect(spy).toHaveBeenCalled();
    });

    it('should open dialog if game is not created', () => {
        const spy = spyOn<any, any>(component, 'openEndGameDialog');
        gameCreatedSource.next(false);
        expect(spy).toHaveBeenCalled();
    });

    it('set hint should make hasHint true and hint to the received number', () => {
        component.setHints(2);
        expect(component.hints).toEqual(2);
        expect(component.hasHint).toEqual(true);
    });

    it('getHint should call onHintButton', () => {
        component.getHint();
        expect(eventhandler.onHintButton).toHaveBeenCalled();
    });

    it(' openPlayerLeftDialog should continue solo once the dialog is closed', () => {
        const spyCreateLobby = spyOn(gameManagerServiceStub, 'continueSolo');
        mockMatDialog.open.and.returnValue({ afterClosed: () => of(PlayerLeftOptions.ContinueSolo) } as unknown as MatDialogRef<
            typeof mockMatDialog
        >);
        component['openPlayerLeftDialog']('2');
        expect(component['matDialog']).toBeDefined();
        expect(spyCreateLobby).toHaveBeenCalled();
    });

    it(' openPlayerLeftDialog should leave the page once the dialog is closed', () => {
        const leaveSpy = spyOn(routerStub, 'navigateByUrl');
        mockMatDialog.open.and.returnValue({ afterClosed: () => of(PlayerLeftOptions.Leave) } as unknown as MatDialogRef<typeof mockMatDialog>);
        component['openPlayerLeftDialog']('2');
        expect(component['matDialog']).toBeDefined();
        expect(leaveSpy).toHaveBeenCalled();
    });
});

@Component({
    selector: 'app-timer',
    template: '',
})
class MockTimerComponent {}

@Component({
    selector: 'app-chat',
    template: '',
})
class MockChatComponent {
    @Input() gameType: string;
}
