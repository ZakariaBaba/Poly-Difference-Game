import { ClearingTool } from './clearing-tool';
import { DrawingTool } from './drawing-tool';

export class Timeline {
    private history: DrawingTool[] = [];
    private undone: DrawingTool[] = [];
    private contextAmount: number = 0;

    add(tool: DrawingTool): void {
        this.assertClear(tool.context);
        this.history.push(tool);
        tool.draw();
        this.undone = [];
    }

    undo(): void {
        if (this.history.length > this.contextAmount) {
            const target = this.history.pop();
            if (target) {
                this.undone.push(target);
                for (const loggedEvent of this.history) {
                    loggedEvent.draw();
                }
            }
        }
    }

    redo(): void {
        const target = this.undone.pop();
        if (target) {
            target.draw();
            this.history.push(target);
        }
    }

    assertClear(ctx: CanvasRenderingContext2D) {
        if (this.isContextAbsent(ctx)) {
            this.addInitialClear(ctx);
        }
    }
    private isContextAbsent(context: CanvasRenderingContext2D): boolean {
        return !this.history.some((value) => {
            return value.context === context;
        });
    }

    private addInitialClear(context: CanvasRenderingContext2D): void {
        this.history.unshift(new ClearingTool(context));
        this.contextAmount++;
    }
}
