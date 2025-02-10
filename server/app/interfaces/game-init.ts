import { Difference } from '@common/interfaces/difference';
import { ConstantParameter } from '@common/interfaces/public-game';

export interface GameInit {
    differences: Difference[];
    constants: ConstantParameter;
    name?: string;
}
