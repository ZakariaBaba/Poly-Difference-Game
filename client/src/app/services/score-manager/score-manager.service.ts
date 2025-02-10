import { HttpClient, HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameType } from '@common/constants';
import { catchError, lastValueFrom, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
    providedIn: 'root',
})
export class ScoreManagerService {
    constructor(private http: HttpClient) {}

    async getScoreById(id: string, gameType: GameType): Promise<HttpResponse<string>> {
        return lastValueFrom(
            this.http
                .get(`${environment.serverUrl}/score/${gameType}/${id}`, { observe: 'response', responseType: 'text' })
                .pipe(catchError(this.handleError)),
        );
    }

    private handleError(error: HttpErrorResponse) {
        if (error.status === HttpStatusCode.ServiceUnavailable) {
            window.alert('La database est hors service: les temps ne peuvent pas être affichés');
        } else {
            window.alert(`Erreur de code ${error.status}`);
        }
        return throwError(() => new Error('Something bad happened; please try again later.'));
    }
}
