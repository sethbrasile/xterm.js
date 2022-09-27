import { IRenderer, IRenderDimensions } from 'browser/renderer/Types';
import { IEvent } from 'common/EventEmitter';
import { Disposable } from 'common/Lifecycle';
import { IColorSet } from 'browser/Types';
import { IOptionsService, IBufferService, IDecorationService } from 'common/services/Services';
import { ICharSizeService, ICoreBrowserService, IRenderService } from 'browser/services/Services';
export declare class RenderService extends Disposable implements IRenderService {
    private _renderer;
    private _rowCount;
    private readonly _charSizeService;
    serviceBrand: undefined;
    private _renderDebouncer;
    private _screenDprMonitor;
    private _isPaused;
    private _needsFullRefresh;
    private _isNextRenderRedrawOnly;
    private _needsSelectionRefresh;
    private _canvasWidth;
    private _canvasHeight;
    private _selectionState;
    private _onDimensionsChange;
    get onDimensionsChange(): IEvent<IRenderDimensions>;
    private _onRenderedViewportChange;
    get onRenderedViewportChange(): IEvent<{
        start: number;
        end: number;
    }>;
    private _onRender;
    get onRender(): IEvent<{
        start: number;
        end: number;
    }>;
    private _onRefreshRequest;
    get onRefreshRequest(): IEvent<{
        start: number;
        end: number;
    }>;
    get dimensions(): IRenderDimensions;
    constructor(_renderer: IRenderer, _rowCount: number, screenElement: HTMLElement, optionsService: IOptionsService, _charSizeService: ICharSizeService, decorationService: IDecorationService, bufferService: IBufferService, coreBrowserService: ICoreBrowserService);
    private _onIntersectionChange;
    refreshRows(start: number, end: number, isRedrawOnly?: boolean): void;
    private _renderRows;
    resize(cols: number, rows: number): void;
    private _handleOptionsChanged;
    private _fireOnCanvasResize;
    dispose(): void;
    setRenderer(renderer: IRenderer): void;
    addRefreshCallback(callback: FrameRequestCallback): number;
    private _fullRefresh;
    clearTextureAtlas(): void;
    setColors(colors: IColorSet): void;
    onDevicePixelRatioChange(): void;
    onResize(cols: number, rows: number): void;
    onCharSizeChanged(): void;
    onBlur(): void;
    onFocus(): void;
    onSelectionChanged(start: [number, number] | undefined, end: [number, number] | undefined, columnSelectMode: boolean): void;
    onCursorMove(): void;
    clear(): void;
}
//# sourceMappingURL=RenderService.d.ts.map