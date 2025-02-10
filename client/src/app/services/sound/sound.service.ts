import { Injectable } from '@angular/core';
import { CORRECT_SOUND_PATH, INCORRECT_SOUND_PATH } from '@app/constants/constant';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SoundService {
    correctAudio: HTMLAudioElement = new Audio();
    incorrectAudio: HTMLAudioElement = new Audio();

    constructor() {
        this.correctAudio.src = environment.serverUrl + CORRECT_SOUND_PATH;
        this.incorrectAudio.src = environment.serverUrl + INCORRECT_SOUND_PATH;
    }

    playCorrectSound(): void {
        this.correctAudio.play().catch();
    }

    playIncorrectSound(): void {
        this.incorrectAudio.play().catch();
    }
}
