import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WaitDialogComponent } from '@app/components/wait-dialog/wait-dialog.component';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { PlayerRequest } from '@common/interfaces/player-request';

@Component({
    selector: 'app-request-dialog',
    templateUrl: './request-dialog.component.html',
    styleUrls: ['./request-dialog.component.scss'],
})
export class RequestDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public joinRequest: PlayerRequest, private lobbyService: LobbyService, private matDialog: MatDialog) {}

    acceptPlayer(): void {
        this.lobbyService.acceptPlayer(this.joinRequest.gameId);
    }

    rejectPlayer(): void {
        this.lobbyService.rejectPlayer(this.joinRequest.gameId);
        this.matDialog.closeAll();
        this.matDialog.open(WaitDialogComponent, { disableClose: true, panelClass: 'my-dialog' });
    }
}
