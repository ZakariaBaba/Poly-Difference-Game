import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ScoreDocument = Score & Document;

@Schema()
export class Score {
    @ApiProperty()
    @Prop()
    gameId: string;

    @ApiProperty()
    @Prop()
    scoresSolo: Score[];

    @ApiProperty()
    @Prop()
    scores1v1: Score[];
}

export const scoreSchema = SchemaFactory.createForClass(Score);
