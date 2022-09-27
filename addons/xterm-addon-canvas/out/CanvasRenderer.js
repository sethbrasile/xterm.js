"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasRenderer = void 0;
const TextRenderLayer_1 = require("./TextRenderLayer");
const SelectionRenderLayer_1 = require("./SelectionRenderLayer");
const CursorRenderLayer_1 = require("./CursorRenderLayer");
const LinkRenderLayer_1 = require("./LinkRenderLayer");
const Lifecycle_1 = require("common/Lifecycle");
const CharAtlasCache_1 = require("./atlas/CharAtlasCache");
const EventEmitter_1 = require("common/EventEmitter");
const DevicePixelObserver_1 = require("browser/renderer/DevicePixelObserver");
let nextRendererId = 1;
class CanvasRenderer extends Lifecycle_1.Disposable {
    constructor(_colors, _screenElement, linkifier2, _bufferService, _charSizeService, _optionsService, characterJoinerService, coreService, _coreBrowserService, decorationService) {
        super();
        this._colors = _colors;
        this._screenElement = _screenElement;
        this._bufferService = _bufferService;
        this._charSizeService = _charSizeService;
        this._optionsService = _optionsService;
        this._coreBrowserService = _coreBrowserService;
        this._id = nextRendererId++;
        this._onRequestRedraw = new EventEmitter_1.EventEmitter();
        const allowTransparency = this._optionsService.rawOptions.allowTransparency;
        this._renderLayers = [
            new TextRenderLayer_1.TextRenderLayer(this._screenElement, 0, this._colors, allowTransparency, this._id, this._bufferService, this._optionsService, characterJoinerService, decorationService, this._coreBrowserService),
            new SelectionRenderLayer_1.SelectionRenderLayer(this._screenElement, 1, this._colors, this._id, this._bufferService, this._coreBrowserService, decorationService, this._optionsService),
            new LinkRenderLayer_1.LinkRenderLayer(this._screenElement, 2, this._colors, this._id, linkifier2, this._bufferService, this._optionsService, decorationService, this._coreBrowserService),
            new CursorRenderLayer_1.CursorRenderLayer(this._screenElement, 3, this._colors, this._id, this._onRequestRedraw, this._bufferService, this._optionsService, coreService, this._coreBrowserService, decorationService)
        ];
        this.dimensions = {
            scaledCharWidth: 0,
            scaledCharHeight: 0,
            scaledCellWidth: 0,
            scaledCellHeight: 0,
            scaledCharLeft: 0,
            scaledCharTop: 0,
            scaledCanvasWidth: 0,
            scaledCanvasHeight: 0,
            canvasWidth: 0,
            canvasHeight: 0,
            actualCellWidth: 0,
            actualCellHeight: 0
        };
        this._devicePixelRatio = this._coreBrowserService.dpr;
        this._updateDimensions();
        this.register((0, DevicePixelObserver_1.observeDevicePixelDimensions)(this._renderLayers[0].canvas, this._coreBrowserService.window, (w, h) => this._setCanvasDevicePixelDimensions(w, h)));
        this.onOptionsChanged();
    }
    get onRequestRedraw() { return this._onRequestRedraw.event; }
    dispose() {
        for (const l of this._renderLayers) {
            l.dispose();
        }
        super.dispose();
        (0, CharAtlasCache_1.removeTerminalFromCache)(this._id);
    }
    onDevicePixelRatioChange() {
        if (this._devicePixelRatio !== this._coreBrowserService.dpr) {
            this._devicePixelRatio = this._coreBrowserService.dpr;
            this.onResize(this._bufferService.cols, this._bufferService.rows);
        }
    }
    setColors(colors) {
        this._colors = colors;
        for (const l of this._renderLayers) {
            l.setColors(this._colors);
            l.reset();
        }
    }
    onResize(cols, rows) {
        this._updateDimensions();
        for (const l of this._renderLayers) {
            l.resize(this.dimensions);
        }
        this._screenElement.style.width = `${this.dimensions.canvasWidth}px`;
        this._screenElement.style.height = `${this.dimensions.canvasHeight}px`;
    }
    onCharSizeChanged() {
        this.onResize(this._bufferService.cols, this._bufferService.rows);
    }
    onBlur() {
        this._runOperation(l => l.onBlur());
    }
    onFocus() {
        this._runOperation(l => l.onFocus());
    }
    onSelectionChanged(start, end, columnSelectMode = false) {
        this._runOperation(l => l.onSelectionChanged(start, end, columnSelectMode));
        if (this._colors.selectionForeground) {
            this._onRequestRedraw.fire({ start: 0, end: this._bufferService.rows - 1 });
        }
    }
    onCursorMove() {
        this._runOperation(l => l.onCursorMove());
    }
    onOptionsChanged() {
        this._runOperation(l => l.onOptionsChanged());
    }
    clear() {
        this._runOperation(l => l.reset());
    }
    _runOperation(operation) {
        for (const l of this._renderLayers) {
            operation(l);
        }
    }
    renderRows(start, end) {
        for (const l of this._renderLayers) {
            l.onGridChanged(start, end);
        }
    }
    clearTextureAtlas() {
        for (const layer of this._renderLayers) {
            layer.clearTextureAtlas();
        }
    }
    _updateDimensions() {
        if (!this._charSizeService.hasValidSize) {
            return;
        }
        const dpr = this._coreBrowserService.dpr;
        this.dimensions.scaledCharWidth = Math.floor(this._charSizeService.width * dpr);
        this.dimensions.scaledCharHeight = Math.ceil(this._charSizeService.height * dpr);
        this.dimensions.scaledCellHeight = Math.floor(this.dimensions.scaledCharHeight * this._optionsService.rawOptions.lineHeight);
        this.dimensions.scaledCharTop = this._optionsService.rawOptions.lineHeight === 1 ? 0 : Math.round((this.dimensions.scaledCellHeight - this.dimensions.scaledCharHeight) / 2);
        this.dimensions.scaledCellWidth = this.dimensions.scaledCharWidth + Math.round(this._optionsService.rawOptions.letterSpacing);
        this.dimensions.scaledCharLeft = Math.floor(this._optionsService.rawOptions.letterSpacing / 2);
        this.dimensions.scaledCanvasHeight = this._bufferService.rows * this.dimensions.scaledCellHeight;
        this.dimensions.scaledCanvasWidth = this._bufferService.cols * this.dimensions.scaledCellWidth;
        this.dimensions.canvasHeight = Math.round(this.dimensions.scaledCanvasHeight / dpr);
        this.dimensions.canvasWidth = Math.round(this.dimensions.scaledCanvasWidth / dpr);
        this.dimensions.actualCellHeight = this.dimensions.canvasHeight / this._bufferService.rows;
        this.dimensions.actualCellWidth = this.dimensions.canvasWidth / this._bufferService.cols;
    }
    _setCanvasDevicePixelDimensions(width, height) {
        this.dimensions.scaledCanvasHeight = height;
        this.dimensions.scaledCanvasWidth = width;
        for (const l of this._renderLayers) {
            l.resize(this.dimensions);
        }
        this._requestRedrawViewport();
    }
    _requestRedrawViewport() {
        this._onRequestRedraw.fire({ start: 0, end: this._bufferService.rows - 1 });
    }
}
exports.CanvasRenderer = CanvasRenderer;
//# sourceMappingURL=CanvasRenderer.js.map