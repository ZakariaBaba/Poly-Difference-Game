import { TestBed } from '@angular/core/testing';
import { SoundService } from './sound.service';

describe('SoundService', () => {
    let service: SoundService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SoundService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('playCorrectSound should call play when called', () => {
        const spy = spyOn(service['correctAudio'], 'play').and.callFake(async (): Promise<void> => {
            return;
        });
        service.playCorrectSound();
        expect(spy).toHaveBeenCalled();
    });

    it('playCorrectSound should call play when called', () => {
        const spy = spyOn(service['incorrectAudio'], 'play').and.callFake(async (): Promise<void> => {
            return;
        });
        service.playIncorrectSound();
        expect(spy).toHaveBeenCalled();
    });
});
