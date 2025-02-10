import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScoreManagerService } from '@app/services/score-manager/score-manager.service';
import { GameScoreComponent } from './game-score.component';

const scoreManagerServiceStub = {
    getScoreById: () => {
        return;
    },
};

describe('GameScoreComponent', () => {
    let component: GameScoreComponent;
    let fixture: ComponentFixture<GameScoreComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameScoreComponent],
            providers: [{ provide: ScoreManagerService, useValue: scoreManagerServiceStub }],
            imports: [MatProgressSpinnerModule],
        }).compileComponents();

        fixture = TestBed.createComponent(GameScoreComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
