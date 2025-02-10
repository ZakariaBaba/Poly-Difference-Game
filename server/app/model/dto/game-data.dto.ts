import { Difference } from '@common/interfaces/difference';
import { ConstantParameter } from '@common/interfaces/public-game';
import { Score } from '@common/interfaces/score';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

// This is the interface for the creation of the game
export class GameDataDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ required: false })
    index?: number;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    originalImage?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    modifiedImage?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    originalSource?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    modifiedSource?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    time1v1?: Score[];

    @ApiProperty({ required: false })
    @IsOptional()
    timeSolo?: Score[];

    @ApiProperty({ required: false })
    @IsOptional()
    numberOfDifference?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    arrayOfDifference?: Difference[];

    @ApiProperty({ required: false })
    @IsOptional()
    isWaiting?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    constantGame?: ConstantParameter;
}
