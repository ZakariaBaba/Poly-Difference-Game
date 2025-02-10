import { Component } from '@angular/core';
import { GameCardManagerService } from '@app/services/game-card-manager/game-card-manager.service';

@Component({
    selector: 'app-confirmation-trash-dialog',
    templateUrl: './confirmation-trash-dialog.component.html',
    styleUrls: ['./confirmation-trash-dialog.component.scss'],
})
export class ConfirmationTrashDialogComponent {
    gameId: string;

    constructor(private gameCardManagerService: GameCardManagerService) {}

    deleteGames(): void {
        this.gameCardManagerService.deleteAllGame();
    }
}
