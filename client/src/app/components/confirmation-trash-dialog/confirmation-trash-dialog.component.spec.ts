import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { GameCardManagerService } from '@app/services/game-card-manager/game-card-manager.service';

import { ConfirmationTrashDialogComponent } from './confirmation-trash-dialog.component';
import SpyObj = jasmine.SpyObj;

describe('ConfirmationTrashDialogComponent', () => {
    let component: ConfirmationTrashDialogComponent;
    let fixture: ComponentFixture<ConfirmationTrashDialogComponent>;
    let mockGameCardManagerSpyObj: SpyObj<GameCardManagerService>;

    beforeEach(async () => {
        mockGameCardManagerSpyObj = jasmine.createSpyObj('GameCardManagerService', ['deleteAllGame']);
        await TestBed.configureTestingModule({
            declarations: [ConfirmationTrashDialogComponent],
            imports: [HttpClientTestingModule, MatDialogModule, MatIconModule],

            providers: [{ provide: GameCardManagerService, useValue: mockGameCardManagerSpyObj }],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfirmationTrashDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should delete all games', () => {
        component.deleteGames();
        expect(mockGameCardManagerSpyObj.deleteAllGame).toHaveBeenCalled();
    });
});
