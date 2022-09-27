import { IRenderDebouncerWithCallback } from 'browser/Types';
export declare class RenderDebouncer implements IRenderDebouncerWithCallback {
    private _parentWindow;
    private _renderCallback;
    private _rowStart;
    private _rowEnd;
    private _rowCount;
    private _animationFrame;
    private _refreshCallbacks;
    constructor(_parentWindow: Window, _renderCallback: (start: number, end: number) => void);
    dispose(): void;
    addRefreshCallback(callback: FrameRequestCallback): number;
    refresh(rowStart: number | undefined, rowEnd: number | undefined, rowCount: number): void;
    private _innerRefresh;
    private _runRefreshCallbacks;
}
//# sourceMappingURL=RenderDebouncer.d.ts.map