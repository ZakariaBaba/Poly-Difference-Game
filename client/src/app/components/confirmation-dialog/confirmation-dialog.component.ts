import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameCardManagerService } from '@app/services/game-card-manager/game-card-manager.service';
import { PublicGame } from '@common/interfaces/public-game';

@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent {
    game: PublicGame;

    constructor(@Inject(MAT_DIALOG_DATA) private data: PublicGame, private gameCardManagerService: GameCardManagerService) {
        this.game = this.data;
    }

    deleteGame(): void {
        this.gameCardManagerService.deleteGame(this.game.id);
    }
}
