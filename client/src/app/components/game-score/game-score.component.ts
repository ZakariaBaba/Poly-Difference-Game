import { HttpStatusCode } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ScoreManagerService } from '@app/services/score-manager/score-manager.service';
import { GameType } from '@common/constants';
import { Score } from '@common/interfaces/score';
@Component({
    selector: 'app-game-score',
    templateUrl: './game-score.component.html',
    styleUrls: ['./game-score.component.scss'],
})
export class GameScoreComponent implements OnInit {
    @Input() gameId: string;
    listOfGame1v1: Score[];
    listOfGameSolo: Score[];
    constructor(private scoreManagerService: ScoreManagerService) {}

    async getScoreById(id: string, gameType: GameType) {
        return await this.scoreManagerService.getScoreById(id, gameType);
    }

    async ngOnInit(): Promise<void> {
        const soloResponse = await this.getScoreById(this.gameId, GameType.Solo);
        if (soloResponse?.status === HttpStatusCode.Ok) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.listOfGameSolo = JSON.parse(soloResponse.body!);
        }
        const multiplayerResponse = await this.getScoreById(this.gameId, GameType.Multiplayer);
        if (multiplayerResponse?.status === HttpStatusCode.Ok) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.listOfGame1v1 = JSON.parse(multiplayerResponse.body!);
        }
    }
}
