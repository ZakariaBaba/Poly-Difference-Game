import { HttpClient, HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameCardInfo } from '@common/interfaces/game-card-info';
import { catchError, firstValueFrom, lastValueFrom, Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameCardManagerService {
    constructor(private http: HttpClient) {}

    async getGamesAtIndex(index: number): Promise<GameCardInfo> {
        return firstValueFrom(
            this.http
                .get<GameCardInfo>(`${environment.serverUrl}/game?index=${index}`)
                .pipe(catchError(this.handleError<GameCardInfo>('getGamesAtIndex'))),
        );
    }

    async resetScore(id: string): Promise<HttpResponse<string>> {
        return lastValueFrom(
            this.http
                .post(`${environment.serverUrl}/score/initScore/${id}`, {}, { observe: 'response', responseType: 'text' })
                .pipe(catchError(this.handleScoreError)),
        );
    }

    async resetAllScore(id: string): Promise<HttpResponse<string>> {
        return lastValueFrom(
            this.http
                .post(`${environment.serverUrl}/score/initAllScore/${id}`, {}, { observe: 'response', responseType: 'text' })
                .pipe(catchError(this.handleScoreError)),
        );
    }

    async deleteGame(id: string): Promise<GameCardInfo> {
        return firstValueFrom(
            this.http.delete<GameCardInfo>(`${environment.serverUrl}/game/${id}`).pipe(catchError(this.handleError<GameCardInfo>('deleteGame'))),
        );
    }

    async deleteAllGame(): Promise<GameCardInfo> {
        return firstValueFrom(
            this.http.delete<GameCardInfo>(`${environment.serverUrl}/game/`).pipe(catchError(this.handleError<GameCardInfo>('deleteGame'))),
        );
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
    private handleScoreError(error: HttpErrorResponse) {
        if (error.status === HttpStatusCode.ServiceUnavailable) {
            window.alert('La database est hors service: les temps ne peuvent pas être affichés');
        } else {
            window.alert(`Erreur de code ${error.status}`);
        }
        return throwError(() => new Error('Something bad happened; please try again later.'));
    }
}
