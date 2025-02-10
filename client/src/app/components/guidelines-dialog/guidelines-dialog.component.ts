import { Component, HostListener } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-guidelines-dialog',
    templateUrl: './guidelines-dialog.component.html',
    styleUrls: ['./guidelines-dialog.component.scss'],
})
export class GuidelinesDialogComponent {
    constructor(private dialogRef: MatDialogRef<GuidelinesDialogComponent>) {}
    @HostListener('window:keyup', ['$event'])
    onDialogClick(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.close();
        }
    }

    close(): void {
        this.dialogRef.close(true);
    }
}
