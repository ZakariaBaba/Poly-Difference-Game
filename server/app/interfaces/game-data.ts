import { GameDataDto } from '@app/model/dto/game-data.dto';
import { ConstantParameter } from '@common/interfaces/public-game';

export interface GameData {
    listOfGames: GameDataDto[];
    constantGame: ConstantParameter;
}
