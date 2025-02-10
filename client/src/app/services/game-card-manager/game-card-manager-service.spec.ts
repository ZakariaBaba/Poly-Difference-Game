import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GameCardInfo } from '@common/interfaces/game-card-info';
import { Score } from '@common/interfaces/score';
import { environment } from 'src/environments/environment';
import { GameCardManagerService } from './game-card-manager.service';

describe('GameCardManagerService', () => {
    let service: GameCardManagerService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(GameCardManagerService);
        httpMock = TestBed.inject(HttpTestingController);
    });
    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should throw alert with La database est hors service: les temps ne peuvent pas être affichés', () => {
        const errorResponse = new HttpErrorResponse({
            error: '503 error',
            status: 503,
            statusText: 'Service Unavailable',
        });
        spyOn(window, 'alert');
        service['handleScoreError'](errorResponse);
        expect(window.alert).toHaveBeenCalledWith('La database est hors service: les temps ne peuvent pas être affichés');
    });

    it('should throw alert with Erreur de code 404', () => {
        const errorResponse = new HttpErrorResponse({
            error: '404 error',
            status: 404,
            statusText: 'Not Found',
        });
        spyOn(window, 'alert');
        service['handleScoreError'](errorResponse);
        expect(window.alert).toHaveBeenCalledWith('Erreur de code 404');
    });

    it('should return expected message (HttpClient called once)', () => {
        const expectedGameCardInfo: GameCardInfo = {
            listOfGames: [
                {
                    id: 'fa689a60-d4f4-4939-9dd5-a29a6c0907f3',
                    name: 'string',
                    originalSource: 'http://localhost:3000/api/list-game/original-image/fa689a60-d4f4-4939-9dd5-a29a6c0907f3',
                    modifiedSource: 'http://localhost:3000/api/list-game/modified-image/fa689a60-d4f4-4939-9dd5-a29a6c0907f3',
                    time1v1: {} as Score[],
                    timeSolo: {} as Score[],
                    numberOfDifference: 0,
                    isWaiting: false,
                },
                {
                    id: '71fd8489-b385-47a1-9f99-935bebbc1379',
                    name: 'waddawwda',
                    originalSource: 'http://localhost:3000/api/list-game/original-image/71fd8489-b385-47a1-9f99-935bebbc1379',
                    modifiedSource: 'http://localhost:3000/api/list-game/modified-image/71fd8489-b385-47a1-9f99-935bebbc1379',
                    time1v1: {} as Score[],
                    timeSolo: {} as Score[],
                    numberOfDifference: 3,
                    isWaiting: false,
                },
            ],
            isThereMoreGames: false,
        };
        service.getGamesAtIndex(0).then((data) => {
            expect(data).toEqual(expectedGameCardInfo);
        });

        const req = httpMock.expectOne(`${environment.serverUrl}/game?index=0`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedGameCardInfo);
    });

    it('deleteGame should return expected message', async () => {
        const expectedGameCardInfo: GameCardInfo = {
            listOfGames: [
                {
                    id: 'fa689a60-d4f4-4939-9dd5-a29a6c0907f3',
                    name: 'string',
                    originalSource: 'http://localhost:3000/api/list-game/original-image/fa689a60-d4f4-4939-9dd5-a29a6c0907f3',
                    modifiedSource: 'http://localhost:3000/api/list-game/modified-image/fa689a60-d4f4-4939-9dd5-a29a6c0907f3',
                    time1v1: {} as Score[],
                    timeSolo: {} as Score[],
                    numberOfDifference: 0,
                    isWaiting: false,
                },
            ],
            isThereMoreGames: false,
        };
        const deleteGameId = 'fa689a60-d4f4-4939-9dd5-a29a6c0907f3';
        service.deleteGame(deleteGameId).then((data) => {
            expect(data).toEqual(expectedGameCardInfo);
        });

        const req = httpMock.expectOne(`${environment.serverUrl}/game/fa689a60-d4f4-4939-9dd5-a29a6c0907f3`);
        expect(req.request.method).toBe('DELETE');
        req.flush(expectedGameCardInfo);
    });

    it('deleteAllGame should return expected message', async () => {
        const expectedGameCardInfo: GameCardInfo = {
            listOfGames: [
                {
                    id: 'fa689a60-d4f4-4939-9dd5-a29a6c0907f3',
                    name: 'string',
                    originalSource: 'http://localhost:3000/api/list-game/original-image/fa689a60-d4f4-4939-9dd5-a29a6c0907f3',
                    modifiedSource: 'http://localhost:3000/api/list-game/modified-image/fa689a60-d4f4-4939-9dd5-a29a6c0907f3',
                    time1v1: {} as Score[],
                    timeSolo: {} as Score[],
                    numberOfDifference: 0,
                    isWaiting: false,
                },
            ],
            isThereMoreGames: false,
        };
        service.deleteAllGame().then((data) => {
            expect(data).toEqual(expectedGameCardInfo);
        });

        const req = httpMock.expectOne(`${environment.serverUrl}/game/`);
        expect(req.request.method).toBe('DELETE');
        req.flush(expectedGameCardInfo);
    });

    it('resetAllScore should call post', () => {
        const expectedGameCardInfo: GameCardInfo = {
            listOfGames: [
                {
                    id: 'fa689a60-d4f4-4939-9dd5-a29a6c0907f3',
                    name: 'string',
                    originalSource: 'http://localhost:3000/api/list-game/original-image/fa689a60-d4f4-4939-9dd5-a29a6c0907f3',
                    modifiedSource: 'http://localhost:3000/api/list-game/modified-image/fa689a60-d4f4-4939-9dd5-a29a6c0907f3',
                    time1v1: {} as Score[],
                    timeSolo: {} as Score[],
                    numberOfDifference: 0,
                    isWaiting: false,
                },
                {
                    id: '71fd8489-b385-47a1-9f99-935bebbc1379',
                    name: 'waddawwda',
                    originalSource: 'http://localhost:3000/api/list-game/original-image/71fd8489-b385-47a1-9f99-935bebbc1379',
                    modifiedSource: 'http://localhost:3000/api/list-game/modified-image/71fd8489-b385-47a1-9f99-935bebbc1379',
                    time1v1: {} as Score[],
                    timeSolo: {} as Score[],
                    numberOfDifference: 3,
                    isWaiting: false,
                },
            ],
            isThereMoreGames: false,
        };
        service.resetAllScore(expectedGameCardInfo.listOfGames[0].id).then((data) => {
            expect(data.status).toEqual(HttpStatusCode.Ok);
        });

        const req = httpMock.expectOne(`${environment.serverUrl}/score/initAllScore/fa689a60-d4f4-4939-9dd5-a29a6c0907f3`);
        expect(req.request.method).toBe('POST');
        req.flush(expectedGameCardInfo);
    });

    it('resetScore should call post', () => {
        const expectedGameCardInfo: GameCardInfo = {
            listOfGames: [
                {
                    id: 'fa689a60-d4f4-4939-9dd5-a29a6c0907f3',
                    name: 'string',
                    originalSource: 'http://localhost:3000/api/list-game/original-image/fa689a60-d4f4-4939-9dd5-a29a6c0907f3',
                    modifiedSource: 'http://localhost:3000/api/list-game/modified-image/fa689a60-d4f4-4939-9dd5-a29a6c0907f3',
                    time1v1: {} as Score[],
                    timeSolo: {} as Score[],
                    numberOfDifference: 0,
                    isWaiting: false,
                },
                {
                    id: '71fd8489-b385-47a1-9f99-935bebbc1379',
                    name: 'waddawwda',
                    originalSource: 'http://localhost:3000/api/list-game/original-image/71fd8489-b385-47a1-9f99-935bebbc1379',
                    modifiedSource: 'http://localhost:3000/api/list-game/modified-image/71fd8489-b385-47a1-9f99-935bebbc1379',
                    time1v1: {} as Score[],
                    timeSolo: {} as Score[],
                    numberOfDifference: 3,
                    isWaiting: false,
                },
            ],
            isThereMoreGames: false,
        };
        service.resetScore(expectedGameCardInfo.listOfGames[0].id).then((data) => {
            expect(data.status).toEqual(HttpStatusCode.Ok);
        });

        const req = httpMock.expectOne(`${environment.serverUrl}/score/initScore/fa689a60-d4f4-4939-9dd5-a29a6c0907f3`);
        expect(req.request.method).toBe('POST');
        req.flush(expectedGameCardInfo);
    });
});
