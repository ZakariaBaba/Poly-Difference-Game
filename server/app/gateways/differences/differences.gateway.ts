import { DifferencesService } from '@app/services/differences/differences.service';
import { DifferencesEvents } from '@common/events/differences.events';
import { GameEvents } from '@common/events/game.events';
import { Coordinates } from '@common/interfaces/coordinates';
import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class DifferencesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private readonly logger: Logger, private differencesService: DifferencesService) {}

    @SubscribeMessage(DifferencesEvents.Validate)
    validate(socket: Socket, coordinates: Coordinates) {
        const difference = this.differencesService.validateDifference(socket.id, coordinates);
        if (difference) {
            socket.emit(DifferencesEvents.DifferenceFound, difference);
            socket.emit(DifferencesEvents.DifferenceCount, this.differencesService.getDifferenceCount(socket.id));
        } else {
            socket.emit(DifferencesEvents.ErrorDifference);
        }
    }

    @SubscribeMessage(GameEvents.CreateGame)
    createGameDifferences(socket: Socket, gameCardId: string) {
        this.differencesService.setGameDifferences(socket.id, gameCardId);
    }

    handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
    }

    handleDisconnect(socket: Socket) {
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id}`);
        this.differencesService.deleteGameDifferences(socket.id);
    }
}
