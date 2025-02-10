import { Component, OnInit } from '@angular/core';
import { PENCIL_COLOR, PENCIL_RADIUS } from '@app/constants/constant';
import { ToolService } from '@app/services/tool/tool.service';

@Component({
    selector: 'app-tool-selector',
    templateUrl: './tool-selector.component.html',
    styleUrls: ['./tool-selector.component.scss'],
})
export class ToolSelectorComponent implements OnInit {
    constructor(private toolService: ToolService) {}
    ngOnInit(): void {
        this.toolService.tool = 0;
        this.toolService.lineWidth = PENCIL_RADIUS;
        this.toolService.color = PENCIL_COLOR;
        this.buttonsTools('pencil', 'active');
        this.buttonsTools('thickness1', 'activate-border');
        this.buttonsTools('black', 'smaller');
    }
    setTool(tool: number): void {
        this.toolService.tool = tool;
    }

    setStrockeWidth(width: number): void {
        this.toolService.lineWidth = width;
    }

    setStrokeColor(color: string): void {
        this.toolService.color = color;
    }

    undo(): void {
        this.toolService.undo();
    }

    redo(): void {
        this.toolService.redo();
    }
    buttonsTools(id: string, className: string): void {
        const button = document.querySelector('.' + className);
        button?.classList.remove(className);
        const element = document.getElementById(id);
        element?.classList.add(className);
    }
}
