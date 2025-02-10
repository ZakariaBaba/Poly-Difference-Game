import { ImageController } from '@app/controllers/image/image.controller';
import { ScoreController } from '@app/controllers/score/score.controller';
import { ScoreService } from '@app/services/score/score.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { Timer } from './classes/timer/timer';
import { GameController } from './controllers/game/game.controller';
import { SoundController } from './controllers/sound/sound.controller';
import { ChatGateway } from './gateways/chat/chat.gateway';
import { GameGateway } from './gateways/game/game.gateway';
import { LobbyGateway } from './gateways/lobby/lobby.gateway';
import { GameScore, gameScoreSchema } from './model/dto/schema/game-score';
import { ChatService } from './services/chat/chat.service';
import { DatabaseService } from './services/database/database.service';
import { GameCreationService } from './services/game-creation/game-creation.service';
import { GameManagerService } from './services/game-manager/game-manager.service';
import { ListGameService } from './services/list-game/list-game.service';
import { LobbyManagerService } from './services/lobby-manager/lobby-manager.service';
import { SoundService } from './services/sound/sound.service';
@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_URL'), // Loaded from .env
            }),
        }),
        MulterModule,
        MongooseModule.forFeature([{ name: GameScore.name, schema: gameScoreSchema }]),
    ],
    controllers: [GameController, ImageController, SoundController, ScoreController],
    providers: [
        ChatGateway,
        ChatService,
        Timer,
        GameGateway,
        LobbyGateway,
        GameManagerService,
        Logger,
        GameCreationService,
        ListGameService,
        LobbyManagerService,
        SoundService,
        DatabaseService,
        ScoreService,
    ],
})
export class AppModule {}
