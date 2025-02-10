import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreationPageComponent } from '@app/pages/creation-page/creation-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { GameSelectComponent } from '@app/pages/game-select/game-select.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game_select', component: GameSelectComponent },
    { path: 'admin', component: GameSelectComponent },
    { path: 'creation', component: CreationPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
