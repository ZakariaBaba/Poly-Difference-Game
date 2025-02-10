// Taken from a class example by Nikolay Radoev
// Source: https://gitlab.com/nikolayradoev/socket-io-exemple

/* eslint-disable */

import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    socket: Socket;
    serverUrl: string = environment.socketUrl;
    isSocketAlive() {
        return this.socket && this.socket.connected;
    }

    connect() {
        this.socket = io(this.serverUrl, { transports: ['websocket'], upgrade: false });
    }

    disconnect() {
        this.socket.disconnect();
    }

    on<T>(event: string, action: (data: T) => void): void {
        this.socket.on(event, action);
    }

    send<T>(event: string, data?: T): void {
        if (data) {
            this.socket.emit(event, data);
        } else {
            this.socket.emit(event);
        }
    }
}
