/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { ChatService } from '@app/services/chat/chat.service';
import { Message, MessageType } from '@common/interfaces/message';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { ChatGateway } from './chat.gateway';

describe('ChatGateway', () => {
    let gateway: ChatGateway;
    let chatService: SinonStubbedInstance<ChatService>;
    let server: SinonStubbedInstance<Server>;
    let socket: SinonStubbedInstance<Socket>;

    beforeEach(async () => {
        chatService = createStubInstance(ChatService);
        server = createStubInstance<Server>(Server);
        socket = createStubInstance<Socket>(Socket);
        const module: TestingModule = await Test.createTestingModule({
            providers: [ChatGateway, { provide: ChatService, useValue: chatService }],
        }).compile();
        gateway = module.get<ChatGateway>(ChatGateway);
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
    it('handleMessage', () => {
        chatService.formatPlayerMessage.returns({ type: MessageType.Host, content: 'test', time: 'test' } as Message);
        server.to.returns({
            emit: (event: string) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);
        const getRoomIdSpy = jest.spyOn(chatService, 'getRoomId');
        const formatPlayerMessageSpy = jest.spyOn(chatService, 'formatPlayerMessage');
        const testMessage = 'testMessage';
        gateway.handleMessage(socket, testMessage);
        expect(getRoomIdSpy).toHaveBeenCalled();
        expect(formatPlayerMessageSpy).toHaveBeenCalled();
    });
});
