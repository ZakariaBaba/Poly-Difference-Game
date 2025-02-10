/* eslint-disable max-classes-per-file */
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { CreationPageComponent } from './creation-page.component';

describe('CreationPageComponent', () => {
    let component: CreationPageComponent;
    let fixture: ComponentFixture<CreationPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreationPageComponent, MockZoneEditComponent, MockToolSelectorComponent],
            imports: [MatIconModule, MatDividerModule],
        }).compileComponents();

        fixture = TestBed.createComponent(CreationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

@Component({
    selector: 'app-zone-edit',
    template: '',
})
class MockZoneEditComponent {}

@Component({
    selector: 'app-tool-selector',
    template: '',
})
class MockToolSelectorComponent {}
