import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameCardManagerService } from '@app/services/game-card-manager/game-card-manager.service';
import { PublicGame } from '@common/interfaces/public-game';

@Component({
    selector: 'app-score-reset-dialog',
    templateUrl: './score-reset-dialog.component.html',
    styleUrls: ['./score-reset-dialog.component.scss'],
})
export class ScoreResetDialogComponent {
    game: PublicGame;

    constructor(@Inject(MAT_DIALOG_DATA) private data: PublicGame, private gameCardManagerService: GameCardManagerService) {
        this.game = this.data;
    }

    async initScore() {
        await this.gameCardManagerService.resetScore(this.game.id);
    }
}
