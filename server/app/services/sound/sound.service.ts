import { Injectable } from '@nestjs/common';
import { readFile } from 'fs';

@Injectable()
export class SoundService {
    async read(path: string): Promise<string> {
        return new Promise((resolve, reject) => {
            readFile(path, 'utf-8', async (error, data) => {
                if (error) {
                    reject('ERROR');
                } else {
                    resolve(data);
                }
            });
        });
    }
}
