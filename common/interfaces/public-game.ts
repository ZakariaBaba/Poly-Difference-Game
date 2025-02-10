import { Score } from './score';

export interface PublicGame {
    id: string;
    name: string;
    originalSource: string;
    modifiedSource: string;
    timeSolo?: Score[];
    time1v1?: Score[];
    numberOfDifference: number;
    isWaiting: boolean;
}

export interface ConstantParameter {
    totalTime: number;
    timeWon: number;
    penalty: number;
}
