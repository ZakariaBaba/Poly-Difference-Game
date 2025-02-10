import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '@app/constants/constant';
import { PlayerNameDialogData } from '@app/interfaces/player-name-dialog-data';
import { GameType } from '@common/constants';
import { PlayerRequest } from '@common/interfaces/player-request';

@Component({
    selector: 'app-player-name-dialog',
    templateUrl: './player-name-dialog.component.html',
    styleUrls: ['./player-name-dialog.component.scss'],
})
export class PlayerNameDialogComponent {
    playerName = new FormControl<string>('', [Validators.required, Validators.minLength(NAME_MIN_LENGTH), Validators.maxLength(NAME_MAX_LENGTH)]);

    constructor(public dialogRef: MatDialogRef<PlayerNameDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: PlayerNameDialogData) {}

    close(): void {
        this.dialogRef.close();
    }

    onSubmitNormalMode(): void {
        if (this.playerName.valid) {
            this.dialogRef.close(this.playerName.value);
        }
    }

    onSubmitSprintSoloMode(): void {
        if (this.playerName.valid) {
            this.dialogRef.close({ playerName: this.playerName.value, type: GameType.Solo } as PlayerRequest);
        }
    }

    onSubmitSprintMultiplayerMode(): void {
        if (this.playerName.valid) {
            this.dialogRef.close({ playerName: this.playerName.value, type: GameType.Multiplayer } as PlayerRequest);
        }
    }

    getErrorMessage(): string {
        if (this.playerName.hasError('required')) {
            return 'Vous devez entrer un nom';
        }
        if (this.playerName.hasError('minlength')) {
            return `Le nom doit comporter ${NAME_MIN_LENGTH} caractères ou plus`;
        }

        return this.playerName.hasError('maxlength') ? `Le nom doit comporter moins de ${NAME_MAX_LENGTH} caractères` : '';
    }
}
