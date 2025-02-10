import { Component, Input, OnInit } from '@angular/core';
import { TIME_BEFORE_SCROLL } from '@app/constants/constant';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { GameType } from '@common/constants';
import { ChatEvents } from '@common/events/chat.events';
import { Message } from '@common/interfaces/message';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
    @Input() gameType: string;
    messages: Message[] = [];

    constructor(private socketClientService: SocketClientService) {}

    ngOnInit(): void {
        this.listenMessageEvent();
    }

    sendMessage(): boolean {
        const htmlInputElement = document.getElementById('input-box') as HTMLInputElement;
        if (htmlInputElement.value.trim() !== '') {
            this.socketClientService.send(ChatEvents.MESSAGE_SERVER, htmlInputElement.value);
            htmlInputElement.value = '';
        }
        return false;
    }

    listenMessageEvent(): void {
        this.socketClientService.on(ChatEvents.MESSAGE_CLIENT, (message: Message) => {
            this.messages.push(message);
            this.scrollToBottom();
        });
    }

    scrollToBottom(): void {
        const htmlDivElement = document.getElementById('body-box') as HTMLDivElement;
        setTimeout(() => {
            htmlDivElement.scrollTop = htmlDivElement.scrollHeight;
        }, TIME_BEFORE_SCROLL);
    }

    isSolo(): boolean {
        return this.gameType === GameType.Solo;
    }
}
