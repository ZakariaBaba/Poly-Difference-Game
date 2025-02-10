import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SavedGameMessage } from '@app/interfaces/game';
@Component({
    selector: 'app-save-confirmation-dialog',
    templateUrl: './save-confirmation-dialog.component.html',
    styleUrls: ['./save-confirmation-dialog.component.scss'],
})
export class SaveConfirmationDialogComponent implements OnInit {
    confirmationText: string;
    isSave: boolean;

    constructor(@Inject(MAT_DIALOG_DATA) private message: SavedGameMessage, public dialogRef: MatDialogRef<SaveConfirmationDialogComponent>) {}

    ngOnInit(): void {
        this.confirmationText = this.message.text;
        this.isSave = this.message.isSaved;
    }

    onClose(): void {
        this.dialogRef.close();
    }
}
