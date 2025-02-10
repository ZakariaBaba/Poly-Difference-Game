import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { GameCommunicationService } from './game-communication.service';

describe('GameCommunicationService', () => {
    let service: GameCommunicationService;
    let httpMock: HttpTestingController;
    let baseUrl: string;
    const id = '123';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(GameCommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
        baseUrl = environment.serverUrl;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('getGameinfo should call get', () => {
        service.getGameInfo(id).subscribe();
        const req = httpMock.expectOne(`${baseUrl}/game/${id}`);
        expect(req.request.method).toBe('GET');
        // actually send the request
        req.flush(id);
    });
    it('getOriginalImage should call get', () => {
        service.getOriginalImage(id).subscribe();
        const req = httpMock.expectOne(`${baseUrl}/image/original-image/${id}`);
        expect(req.request.method).toBe('GET');
        // actually send the request
        req.flush(id);
    });
    it('getModifiedimage should call get', () => {
        service.getModifiedImage(id).subscribe();
        const req = httpMock.expectOne(`${baseUrl}/image/modified-image/${id}`);
        expect(req.request.method).toBe('GET');
        // actually send the request
        req.flush(id);
    });
});
