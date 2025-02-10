import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { LobbyService } from '@app/services/lobby/lobby.service';

@Component({
    selector: 'app-wait-dialog',
    templateUrl: './wait-dialog.component.html',
    styleUrls: ['./wait-dialog.component.scss'],
})
export class WaitDialogComponent {
    constructor(private lobbyService: LobbyService, public dialogRef: MatDialogRef<WaitDialogComponent>) {}

    onClose(): void {
        this.lobbyService.leaveLobby();
        this.dialogRef.close();
    }
}
