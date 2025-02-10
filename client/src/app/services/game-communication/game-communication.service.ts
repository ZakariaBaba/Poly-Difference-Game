import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PublicGame } from '@common/interfaces/public-game';
import { catchError, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameCommunicationService {
    constructor(private readonly http: HttpClient) {}

    getGameInfo(id: string): Observable<PublicGame> {
        return this.http.get<PublicGame>(`${environment.serverUrl}/game/${id}`).pipe(catchError(this.handleError<PublicGame>('getGame')));
    }

    getOriginalImage(id: string): Observable<string> {
        return this.http.get<string>(`${environment.serverUrl}/image/original-image/${id}`).pipe(catchError(this.handleError<string>('getImage')));
    }

    getModifiedImage(id: string): Observable<string> {
        return this.http.get<string>(`${environment.serverUrl}/image/modified-image/${id}`).pipe(catchError(this.handleError<string>('getImage')));
    }

    handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
