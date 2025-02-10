export interface Message {
    time: string;
    content: string;
    type: MessageType;
    name?: string;
}

export enum MessageType {
    Host = 'host',
    Guest = 'guest',
    System = 'system',
}
