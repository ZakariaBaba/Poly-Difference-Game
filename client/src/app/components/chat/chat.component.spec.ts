import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { TIME_BEFORE_SCROLL } from '@app/constants/constant';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { ChatEvents } from '@common/events/chat.events';
import { Message, MessageType } from '@common/interfaces/message';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { ChatComponent } from './chat.component';

class ActivatedRouteMock {
    queryParams = of(() => {
        return { type: 'solo' };
    });
}

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;
    let socketServiceMock: SocketClientService;
    let socketHelper: SocketTestHelper;

    beforeEach(async () => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientService();
        socketServiceMock.socket = socketHelper as unknown as Socket;
        await TestBed.configureTestingModule({
            declarations: [ChatComponent],
            providers: [
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: ActivatedRoute, useValue: new ActivatedRouteMock() },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should send message', () => {
        const htmlInputElement = document.getElementById('input-box') as HTMLInputElement;
        htmlInputElement.value = 'test';
        const spy = spyOn(socketServiceMock, 'send');
        component.sendMessage();
        expect(spy).toHaveBeenCalled();
    });

    it('should listen message event', () => {
        const htmlInputElement = document.getElementById('input-box') as HTMLInputElement;
        htmlInputElement.value = 'test';
        const message: Message = {
            time: htmlInputElement.value,
            content: htmlInputElement.value,
            type: MessageType.Host,
        };
        socketHelper.peerSideEmit(ChatEvents.MESSAGE_CLIENT, message);
        component.listenMessageEvent();
        expect(component['messages']).toContain(message);
    });

    it('should scroll to bottom', fakeAsync(() => {
        const htmlDivElement = document.getElementById('body-box') as HTMLInputElement;
        tick(TIME_BEFORE_SCROLL);
        expect(htmlDivElement.scrollTop).toEqual(0);
    }));
});
