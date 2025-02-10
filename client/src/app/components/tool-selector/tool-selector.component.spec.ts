/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToolService } from '@app/services/tool/tool.service';

import { ToolSelectorComponent } from './tool-selector.component';
import SpyObj = jasmine.SpyObj;

describe('ToolSelectorComponent', () => {
    let component: ToolSelectorComponent;
    let fixture: ComponentFixture<ToolSelectorComponent>;
    let toolServiceSpy: SpyObj<ToolService>;
    beforeEach(async () => {
        toolServiceSpy = jasmine.createSpyObj('ToolService', ['undo', 'redo']);
        await TestBed.configureTestingModule({
            declarations: [ToolSelectorComponent],
            providers: [{ provide: ToolService, useValue: toolServiceSpy }],
            imports: [MatIconModule, MatDividerModule, MatTooltipModule],
        }).compileComponents();

        fixture = TestBed.createComponent(ToolSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('setTool should set tool', () => {
        component.setTool(1);
        expect(toolServiceSpy.tool).toEqual(1);
    });
    it('setWidth should set width', () => {
        component.setStrockeWidth(30);
        expect(toolServiceSpy.lineWidth).toEqual(30);
    });
    it('setStrokeColor should set color', () => {
        component.setStrokeColor('#ff7a00');
        expect(toolServiceSpy.color).toEqual('#ff7a00');
    });
    it('undo should call toolService Undo', () => {
        component.undo();
        expect(toolServiceSpy.undo).toHaveBeenCalled();
    });
    it('redo should call toolService redo', () => {
        component.redo();
        expect(toolServiceSpy.redo).toHaveBeenCalled();
    });
    it('UxButton/uxButtonSize/uxbuttonColor should change the html element', () => {
        component.buttonsTools('pencil', 'active');

        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('#pencil').classList).toContain('active');
    });
    it('UxButton/uxButtonSize/uxbuttonColor should not change the html element if it doesnt exist', () => {
        component.buttonsTools('penc1il', 'active');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('#pencil').classList).not.toContain('active');
    });
});
