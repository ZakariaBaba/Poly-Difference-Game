import { Score } from '@common/interfaces/score';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type GameScoreDocument = GameScore & Document;

@Schema()
export class GameScore {
    @ApiProperty()
    @Prop({ required: true })
    gameId: string;

    @ApiProperty()
    @Prop({ required: true })
    scores1v1: Score[];

    @ApiProperty()
    @Prop({ required: true })
    scoresSolo: Score[];

    @ApiProperty()
    _id?: string;
}

export const gameScoreSchema = SchemaFactory.createForClass(GameScore);
