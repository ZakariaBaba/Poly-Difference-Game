import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameCardManagerService } from '@app/services/game-card-manager/game-card-manager.service';
import { PublicGame } from '@common/interfaces/public-game';

@Component({
    selector: 'app-reset-all-dialog',
    templateUrl: './reset-all-dialog.component.html',
    styleUrls: ['./reset-all-dialog.component.scss'],
})
export class ResetAllDialogComponent {
    games: PublicGame[];

    constructor(@Inject(MAT_DIALOG_DATA) private data: PublicGame[], private gameCardManagerService: GameCardManagerService) {
        this.games = this.data;
    }

    reloadWindow(): void {
        window.location.reload();
    }

    async initAllScore() {
        if (this.games) {
            for (const game of this.games) {
                await this.gameCardManagerService.resetAllScore(game.id);
            }
        }
        this.reloadWindow();
    }
}
