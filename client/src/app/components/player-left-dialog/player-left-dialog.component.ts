import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlayerLeftOptions } from '@app/constants/constant';

@Component({
    selector: 'app-player-left-dialog',
    templateUrl: './player-left-dialog.component.html',
    styleUrls: ['./player-left-dialog.component.scss'],
})
export class PlayerLeftDialogComponent {
    endGameMessage: string;

    constructor(public dialogRef: MatDialogRef<PlayerLeftDialogComponent>, @Inject(MAT_DIALOG_DATA) private data: string) {
        this.endGameMessage = this.data;
    }

    continueSolo() {
        this.dialogRef.close(PlayerLeftOptions.ContinueSolo);
    }

    leave() {
        this.dialogRef.close(PlayerLeftOptions.Leave);
    }
}
