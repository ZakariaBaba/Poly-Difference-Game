import { DifferencesService } from '@app/services/differences/differences.service';
import { DifferencesEvents } from '@common/events/differences.events';
import { Coordinates } from '@common/interfaces/coordinates';
import { Difference } from '@common/interfaces/difference';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Socket } from 'socket.io';
import { DifferencesGateway } from './differences.gateway';

describe('DifferencesGateway', () => {
    let gateway: DifferencesGateway;
    let logger: SinonStubbedInstance<Logger>;
    let differencesService: SinonStubbedInstance<DifferencesService>;
    let socket: SinonStubbedInstance<Socket>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        differencesService = createStubInstance(DifferencesService);
        socket = createStubInstance<Socket>(Socket);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DifferencesGateway,
                DifferencesService,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: DifferencesService,
                    useValue: differencesService,
                },
            ],
        }).compile();

        gateway = module.get<DifferencesGateway>(DifferencesGateway);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('validate should validate coordinates', () => {
        const testCoordinates: Coordinates = { x: 0, y: 0 };
        differencesService.validateDifference.returns(undefined);
        gateway.validate(socket, testCoordinates);
        expect(differencesService.validateDifference.calledWith(socket.id, testCoordinates));
        expect(socket.emit.calledWith(DifferencesEvents.ErrorDifference));
        const testDifference: Difference = { pixelsPosition: [{ x: 1, y: 2 }] };
        differencesService.validateDifference.returns(testDifference);
        differencesService.getDifferenceCount.returns(1);
        gateway.validate(socket, testCoordinates);
        expect(socket.emit.calledWith(DifferencesEvents.DifferenceFound, testDifference));
        expect(socket.emit.calledWith(DifferencesEvents.DifferenceCount, 1));
    });

    it('createGameDifferences should create game in DifferencesService', () => {
        const testGameCardId = '1';
        gateway.createGameDifferences(socket, testGameCardId);
        expect(differencesService.setGameDifferences.calledWith(socket.id, testGameCardId));
    });

    it('handleDisconnect should delete game in DifferencesService', () => {
        gateway.handleDisconnect(socket);
        expect(differencesService.deleteGameDifferences.calledWith(socket.id));
    });

    it('connections and disconnects should be logged', () => {
        gateway.handleConnection(socket);
        gateway.handleDisconnect(socket);
        expect(logger.log.callCount).toBe(2);
    });
});
