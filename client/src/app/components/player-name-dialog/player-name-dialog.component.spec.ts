import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '@app/constants/constant';
import { PlayerNameDialogData } from '@app/interfaces/player-name-dialog-data';
import { PlayerNameDialogComponent } from './player-name-dialog.component';

const mockMatDialogRef = {
    close: () => {
        return;
    },
};

const data: PlayerNameDialogData = {
    mode: 'classic',
};

describe('PlayerNameDialogComponent', () => {
    let component: PlayerNameDialogComponent;
    let fixture: ComponentFixture<PlayerNameDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlayerNameDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: mockMatDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: data },
            ],
            imports: [MatFormFieldModule, ReactiveFormsModule, MatInputModule, BrowserAnimationsModule, MatIconModule, MatDialogModule],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayerNameDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('close should close the dialog', () => {
        const matDialogSpy = spyOn(mockMatDialogRef, 'close');
        component.close();
        expect(matDialogSpy).toHaveBeenCalled();
    });

    it('onSubmit should close the dialogue once the player name is valid', () => {
        component.playerName = new FormControl<string>('hel', [
            Validators.required,
            Validators.minLength(NAME_MIN_LENGTH),
            Validators.maxLength(NAME_MAX_LENGTH),
        ]);
        const spy = spyOn(component.dialogRef, 'close').and.callThrough();
        component.onSubmitNormalMode();
        expect(spy).toHaveBeenCalled();
    });

    it('onSubmitSprintSoloMode should close the dialogue once the player name is valid', () => {
        component.playerName = new FormControl<string>('hel', [
            Validators.required,
            Validators.minLength(NAME_MIN_LENGTH),
            Validators.maxLength(NAME_MAX_LENGTH),
        ]);
        const spy = spyOn(component.dialogRef, 'close').and.callThrough();
        component.onSubmitSprintSoloMode();
        expect(spy).toHaveBeenCalled();
    });

    it('onSubmitSprintMultiplayerMode should close the dialogue once the player name is valid', () => {
        component.playerName = new FormControl<string>('hel', [
            Validators.required,
            Validators.minLength(NAME_MIN_LENGTH),
            Validators.maxLength(NAME_MAX_LENGTH),
        ]);
        const spy = spyOn(component.dialogRef, 'close').and.callThrough();
        component.onSubmitSprintMultiplayerMode();
        expect(spy).toHaveBeenCalled();
    });

    it('getErrorMessage should return an error message if the playerName is empty', () => {
        component.playerName = new FormControl<string>('', [
            Validators.required,
            Validators.minLength(NAME_MIN_LENGTH),
            Validators.maxLength(NAME_MAX_LENGTH),
        ]);
        component.playerName.updateValueAndValidity();
        const responseIfNameEmpty = component.getErrorMessage();
        expect(responseIfNameEmpty).toEqual('Vous devez entrer un nom');
    });

    it('getErrorMessage should return an error message if the playerName is too short', () => {
        component.playerName = new FormControl<string>('h', [
            Validators.required,
            Validators.minLength(NAME_MIN_LENGTH),
            Validators.maxLength(NAME_MAX_LENGTH),
        ]);

        const responseIfNameTooShort = component.getErrorMessage();
        expect(responseIfNameTooShort).toBe(`Le nom doit comporter ${NAME_MIN_LENGTH} caractères ou plus`);
    });

    it('getErrorMessage should return an error message if the playerName is too long', () => {
        component.playerName = new FormControl<string>('fletchinder', [
            Validators.required,
            Validators.minLength(NAME_MIN_LENGTH),
            Validators.maxLength(NAME_MAX_LENGTH),
        ]);

        const responseIfNameTooLong = component.getErrorMessage();
        expect(responseIfNameTooLong).toBe(`Le nom doit comporter moins de ${NAME_MAX_LENGTH} caractères`);
    });

    it('getErrorMessage should return an empty string if the playerName is valid', () => {
        component.playerName = new FormControl<string>('Pikatchu', [
            Validators.required,
            Validators.minLength(NAME_MIN_LENGTH),
            Validators.maxLength(NAME_MAX_LENGTH),
        ]);

        const responseIfNameTooLong = component.getErrorMessage();
        expect(responseIfNameTooLong).toBe('');
    });
});
