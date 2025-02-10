import { Difference } from '@common/interfaces/difference';
import { ConstantParameter } from '@common/interfaces/public-game';

export interface XLine {
    start: number;
    end: number;
}
export interface Row {
    x: XLine;
    y: number;
}
export interface Score {
    rank: number;
    time: string;
}

// This is the interface for the creation of the game
export interface PrivateGame {
    id?: string;
    name: string;
    originalImage: string;
    modifiedImage: string;
    time?: string[];
    numberOfDifference: number;
    arrayOfDifference?: Difference[];
    constantGame?: ConstantParameter;
}

export interface SavedGameMessage {
    text: string;
    isSaved: boolean;
}
