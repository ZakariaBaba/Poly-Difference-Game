import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '@app/constants/constant';
import { of } from 'rxjs';

import { SaveGameDialogComponent } from './save-game-dialog.component';
import SpyObj = jasmine.SpyObj;

class MatDialogMock {
    open() {
        return {
            afterClosed: () => of({}),
        };
    }
    close() {
        return {};
    }
}
describe('SaveGameDialogComponent', () => {
    let component: SaveGameDialogComponent;
    let fixture: ComponentFixture<SaveGameDialogComponent>;
    let matDialogMock: SpyObj<MatDialogMock>;
    beforeEach(async () => {
        matDialogMock = jasmine.createSpyObj('MatDialogMock', ['open', 'close']);
        await TestBed.configureTestingModule({
            declarations: [SaveGameDialogComponent],
            providers: [{ provide: MatDialogRef, useClass: MatDialogMock }],
            imports: [
                MatDialogModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                BrowserAnimationsModule,
                MatIconModule,
                MatIconModule,
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(SaveGameDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        matDialogMock.close.and.returnValue(component.gameName.value as string);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('onSubmit should call dialog ref close', () => {
        component.gameName.setValue('test');
        component.onSubmit();
        fixture.detectChanges();
        expect(matDialogMock.close).not.toHaveBeenCalled();
    });

    it('should call onSubmit when enter is pressed', () => {
        const element = fixture.nativeElement;
        fixture.detectChanges();
        const event = new KeyboardEvent('keypress', {
            key: 'Enter',
        });
        element.dispatchEvent(event);

        const spy = spyOn(component, 'onSubmit');
        component.onDialogClick(event);
        expect(spy).toHaveBeenCalled();
    });

    it('getErrorMessage should return an error message if the playerName is empty', () => {
        component.gameName = new FormControl<string>('', [
            Validators.required,
            Validators.minLength(NAME_MIN_LENGTH),
            Validators.maxLength(NAME_MAX_LENGTH),
        ]);
        component.gameName.updateValueAndValidity();
        const responseIfNameEmpty = component.getErrorMessage();
        expect(responseIfNameEmpty).toEqual('Vous devez entrer un nom');
    });

    it('getErrorMessage should return an error message if the playerName is too short', () => {
        component.gameName = new FormControl<string>('h', [
            Validators.required,
            Validators.minLength(NAME_MIN_LENGTH),
            Validators.maxLength(NAME_MAX_LENGTH),
        ]);

        const responseIfNameTooShort = component.getErrorMessage();
        expect(responseIfNameTooShort).toBe(`Le nom doit comporter ${NAME_MIN_LENGTH} caractères ou plus`);
    });

    it('getErrorMessage should return an error message if the playerName is too long', () => {
        component.gameName = new FormControl<string>('harryPotter', [
            Validators.required,
            Validators.minLength(NAME_MIN_LENGTH),
            Validators.maxLength(NAME_MAX_LENGTH),
        ]);

        const responseIfNameTooLong = component.getErrorMessage();
        expect(responseIfNameTooLong).toBe(`Le nom doit comporter moins de ${NAME_MAX_LENGTH} caractères`);
    });

    it('getErrorMessage should return an empty string if the playerName is valid', () => {
        component.gameName = new FormControl<string>('Pikatchu', [
            Validators.required,
            Validators.minLength(NAME_MIN_LENGTH),
            Validators.maxLength(NAME_MAX_LENGTH),
        ]);

        const responseIfNameTooLong = component.getErrorMessage();
        expect(responseIfNameTooLong).toBe('');
    });
});
