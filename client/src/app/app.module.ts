import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChatComponent } from '@app/components/chat/chat.component';
import { DifferencePopUpComponent } from '@app/components/difference-pop-up/difference-pop-up.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { PlayerNameDialogComponent } from '@app/components/player-name-dialog/player-name-dialog.component';
import { SaveGameDialogComponent } from '@app/components/save-game-dialog/save-game-dialog.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { ZoneEditComponent } from '@app/components/zone-edit/zone-edit.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { CreationPageComponent } from '@app/pages/creation-page/creation-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { GameSelectComponent } from '@app/pages/game-select/game-select.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { AlertDialogComponent } from './components/alert-dialog/alert-dialog.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationTrashDialogComponent } from './components/confirmation-trash-dialog/confirmation-trash-dialog.component';
import { ConstantDialogComponent } from './components/constant-dialog/constant-dialog.component';
import { EndGameDialogComponent } from './components/end-game-dialog/end-game-dialog.component';
import { GameScoreComponent } from './components/game-score/game-score.component';
import { RequestDialogComponent } from './components/request-dialog/request-dialog.component';
import { ResetAllDialogComponent } from './components/reset-all-dialog/reset-all-dialog.component';
import { SaveConfirmationDialogComponent } from './components/save-confirmation-dialog/save-confirmation-dialog.component';
import { ScoreResetDialogComponent } from './components/score-reset-dialog/score-reset-dialog.component';
import { ToolSelectorComponent } from './components/tool-selector/tool-selector.component';
import { WaitDialogComponent } from './components/wait-dialog/wait-dialog.component';
import { GuidelinesDialogComponent } from './components/guidelines-dialog/guidelines-dialog.component';
import { PlayerLeftDialogComponent } from './components/player-left-dialog/player-left-dialog.component';
import { LeaveConfirmationDialogComponent } from './components/leave-confirmation-dialog/leave-confirmation-dialog.component';
/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        ChatComponent,
        ToolSelectorComponent,
        AppComponent,
        GameSelectComponent,
        GamePageComponent,
        MainPageComponent,
        PlayAreaComponent,
        CreationPageComponent,
        ZoneEditComponent,
        TimerComponent,
        PlayerNameDialogComponent,
        SaveGameDialogComponent,
        DifferencePopUpComponent,
        SaveConfirmationDialogComponent,
        ConstantDialogComponent,
        RequestDialogComponent,
        WaitDialogComponent,
        EndGameDialogComponent,
        ConfirmationDialogComponent,
        AlertDialogComponent,
        ConfirmationTrashDialogComponent,
        ScoreResetDialogComponent,
        ResetAllDialogComponent,
        GameScoreComponent,
        GuidelinesDialogComponent,
        PlayerLeftDialogComponent,
        LeaveConfirmationDialogComponent,
    ],

    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        FlexLayoutModule,
        NgSelectModule,
        ReactiveFormsModule,
        MatProgressSpinnerModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
