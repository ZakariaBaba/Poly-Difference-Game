import { ChatService } from '@app/services/chat/chat.service';
import { ChatEvents } from '@common/events/chat.events';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway()
export class ChatGateway {
    @WebSocketServer() private server: Server;

    constructor(private chatService: ChatService) {}

    @SubscribeMessage(ChatEvents.MESSAGE_SERVER)
    handleMessage(socket: Socket, playerMessage: string) {
        const roomId = this.chatService.getRoomId(socket);
        this.server.to(roomId).emit(ChatEvents.MESSAGE_CLIENT, this.chatService.formatPlayerMessage(playerMessage, socket));
    }
}
