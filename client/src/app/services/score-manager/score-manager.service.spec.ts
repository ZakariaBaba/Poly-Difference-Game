import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GameType } from '@common/constants';
import { Score } from '@common/interfaces/score';
import { environment } from 'src/environments/environment';

import { ScoreManagerService } from './score-manager.service';

describe('ScoreManagerService', () => {
    let service: ScoreManagerService;
    let httpMock: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(ScoreManagerService);
        httpMock = TestBed.inject(HttpTestingController);
    });
    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return expected message (HttpClient called once)', () => {
        const expectedScore: Score[] = [
            {
                playerName: 'string',
                timeInSeconds: 3,
                formattedTime: '3',
            },
            { playerName: 'string1', timeInSeconds: 2, formattedTime: '2' },
        ];
        service.getScoreById('fa689a60-d4f4-4939-9dd5-a29a6c0907f3', GameType.Solo);

        const req = httpMock.expectOne(`${environment.serverUrl}/score/solo/fa689a60-d4f4-4939-9dd5-a29a6c0907f3`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedScore);
    });

    it('should throw alert with La database est hors service: les temps ne peuvent pas être affichés', () => {
        const errorResponse = new HttpErrorResponse({
            error: '503 error',
            status: 503,
            statusText: 'Service Unavailable',
        });
        spyOn(window, 'alert');
        service['handleError'](errorResponse);
        expect(window.alert).toHaveBeenCalledWith('La database est hors service: les temps ne peuvent pas être affichés');
    });

    it('should throw alert with Erreur de code 404', () => {
        const errorResponse = new HttpErrorResponse({
            error: '404 error',
            status: 404,
            statusText: 'Not Found',
        });
        spyOn(window, 'alert');
        service['handleError'](errorResponse);
        expect(window.alert).toHaveBeenCalledWith('Erreur de code 404');
    });
});
