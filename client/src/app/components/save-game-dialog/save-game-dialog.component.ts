import { Component, HostListener } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '@app/constants/constant';

@Component({
    selector: 'app-save-game-dialog',
    templateUrl: './save-game-dialog.component.html',
    styleUrls: ['./save-game-dialog.component.scss'],
})
export class SaveGameDialogComponent {
    gameName = new FormControl<string>('', [Validators.required, Validators.minLength(NAME_MIN_LENGTH), Validators.maxLength(NAME_MAX_LENGTH)]);
    constructor(public dialogRef: MatDialogRef<SaveGameDialogComponent>) {}

    @HostListener('window:keyup', ['$event'])
    onDialogClick(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.onSubmit();
        }
    }

    onSubmit(): void {
        if (this.gameName.valid) {
            this.dialogRef.close(this.gameName.value);
        }
    }

    getErrorMessage(): string {
        if (this.gameName.hasError('required')) {
            return 'Vous devez entrer un nom';
        }
        if (this.gameName.hasError('minlength')) {
            return `Le nom doit comporter ${NAME_MIN_LENGTH} caractères ou plus`;
        }

        return this.gameName.hasError('maxlength') ? `Le nom doit comporter moins de ${NAME_MAX_LENGTH} caractères` : '';
    }
}
