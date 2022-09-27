"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderService = void 0;
const RenderDebouncer_1 = require("browser/RenderDebouncer");
const EventEmitter_1 = require("common/EventEmitter");
const Lifecycle_1 = require("common/Lifecycle");
const ScreenDprMonitor_1 = require("browser/ScreenDprMonitor");
const Lifecycle_2 = require("browser/Lifecycle");
const Services_1 = require("common/services/Services");
const Services_2 = require("browser/services/Services");
let RenderService = class RenderService extends Lifecycle_1.Disposable {
    constructor(_renderer, _rowCount, screenElement, optionsService, _charSizeService, decorationService, bufferService, coreBrowserService) {
        super();
        this._renderer = _renderer;
        this._rowCount = _rowCount;
        this._charSizeService = _charSizeService;
        this._isPaused = false;
        this._needsFullRefresh = false;
        this._isNextRenderRedrawOnly = true;
        this._needsSelectionRefresh = false;
        this._canvasWidth = 0;
        this._canvasHeight = 0;
        this._selectionState = {
            start: undefined,
            end: undefined,
            columnSelectMode: false
        };
        this._onDimensionsChange = new EventEmitter_1.EventEmitter();
        this._onRenderedViewportChange = new EventEmitter_1.EventEmitter();
        this._onRender = new EventEmitter_1.EventEmitter();
        this._onRefreshRequest = new EventEmitter_1.EventEmitter();
        this.register({ dispose: () => this._renderer.dispose() });
        this._renderDebouncer = new RenderDebouncer_1.RenderDebouncer(coreBrowserService.window, (start, end) => this._renderRows(start, end));
        this.register(this._renderDebouncer);
        this._screenDprMonitor = new ScreenDprMonitor_1.ScreenDprMonitor(coreBrowserService.window);
        this._screenDprMonitor.setListener(() => this.onDevicePixelRatioChange());
        this.register(this._screenDprMonitor);
        this.register(bufferService.onResize(() => this._fullRefresh()));
        this.register(bufferService.buffers.onBufferActivate(() => { var _a; return (_a = this._renderer) === null || _a === void 0 ? void 0 : _a.clear(); }));
        this.register(optionsService.onOptionChange(() => this._handleOptionsChanged()));
        this.register(this._charSizeService.onCharSizeChange(() => this.onCharSizeChanged()));
        this.register(decorationService.onDecorationRegistered(() => this._fullRefresh()));
        this.register(decorationService.onDecorationRemoved(() => this._fullRefresh()));
        this._renderer.onRequestRedraw(e => this.refreshRows(e.start, e.end, true));
        this.register((0, Lifecycle_2.addDisposableDomListener)(coreBrowserService.window, 'resize', () => this.onDevicePixelRatioChange()));
        if ('IntersectionObserver' in coreBrowserService.window) {
            const observer = new coreBrowserService.window.IntersectionObserver(e => this._onIntersectionChange(e[e.length - 1]), { threshold: 0 });
            observer.observe(screenElement);
            this.register({ dispose: () => observer.disconnect() });
        }
    }
    get onDimensionsChange() { return this._onDimensionsChange.event; }
    get onRenderedViewportChange() { return this._onRenderedViewportChange.event; }
    get onRender() { return this._onRender.event; }
    get onRefreshRequest() { return this._onRefreshRequest.event; }
    get dimensions() { return this._renderer.dimensions; }
    _onIntersectionChange(entry) {
        this._isPaused = entry.isIntersecting === undefined ? (entry.intersectionRatio === 0) : !entry.isIntersecting;
        if (!this._isPaused && !this._charSizeService.hasValidSize) {
            this._charSizeService.measure();
        }
        if (!this._isPaused && this._needsFullRefresh) {
            this.refreshRows(0, this._rowCount - 1);
            this._needsFullRefresh = false;
        }
    }
    refreshRows(start, end, isRedrawOnly = false) {
        if (this._isPaused) {
            this._needsFullRefresh = true;
            return;
        }
        if (!isRedrawOnly) {
            this._isNextRenderRedrawOnly = false;
        }
        this._renderDebouncer.refresh(start, end, this._rowCount);
    }
    _renderRows(start, end) {
        this._renderer.renderRows(start, end);
        if (this._needsSelectionRefresh) {
            this._renderer.onSelectionChanged(this._selectionState.start, this._selectionState.end, this._selectionState.columnSelectMode);
            this._needsSelectionRefresh = false;
        }
        if (!this._isNextRenderRedrawOnly) {
            this._onRenderedViewportChange.fire({ start, end });
        }
        this._onRender.fire({ start, end });
        this._isNextRenderRedrawOnly = true;
    }
    resize(cols, rows) {
        this._rowCount = rows;
        this._fireOnCanvasResize();
    }
    _handleOptionsChanged() {
        this._renderer.onOptionsChanged();
        this.refreshRows(0, this._rowCount - 1);
        this._fireOnCanvasResize();
    }
    _fireOnCanvasResize() {
        if (this._renderer.dimensions.canvasWidth === this._canvasWidth && this._renderer.dimensions.canvasHeight === this._canvasHeight) {
            return;
        }
        this._onDimensionsChange.fire(this._renderer.dimensions);
    }
    dispose() {
        super.dispose();
    }
    setRenderer(renderer) {
        this._renderer.dispose();
        this._renderer = renderer;
        this._renderer.onRequestRedraw(e => this.refreshRows(e.start, e.end, true));
        this._needsSelectionRefresh = true;
        this._fullRefresh();
    }
    addRefreshCallback(callback) {
        return this._renderDebouncer.addRefreshCallback(callback);
    }
    _fullRefresh() {
        if (this._isPaused) {
            this._needsFullRefresh = true;
        }
        else {
            this.refreshRows(0, this._rowCount - 1);
        }
    }
    clearTextureAtlas() {
        var _a, _b;
        (_b = (_a = this._renderer) === null || _a === void 0 ? void 0 : _a.clearTextureAtlas) === null || _b === void 0 ? void 0 : _b.call(_a);
        this._fullRefresh();
    }
    setColors(colors) {
        this._renderer.setColors(colors);
        this._fullRefresh();
    }
    onDevicePixelRatioChange() {
        this._charSizeService.measure();
        this._renderer.onDevicePixelRatioChange();
        this.refreshRows(0, this._rowCount - 1);
    }
    onResize(cols, rows) {
        this._renderer.onResize(cols, rows);
        this._fullRefresh();
    }
    onCharSizeChanged() {
        this._renderer.onCharSizeChanged();
    }
    onBlur() {
        this._renderer.onBlur();
    }
    onFocus() {
        this._renderer.onFocus();
    }
    onSelectionChanged(start, end, columnSelectMode) {
        this._selectionState.start = start;
        this._selectionState.end = end;
        this._selectionState.columnSelectMode = columnSelectMode;
        this._renderer.onSelectionChanged(start, end, columnSelectMode);
    }
    onCursorMove() {
        this._renderer.onCursorMove();
    }
    clear() {
        this._renderer.clear();
    }
};
RenderService = __decorate([
    __param(3, Services_1.IOptionsService),
    __param(4, Services_2.ICharSizeService),
    __param(5, Services_1.IDecorationService),
    __param(6, Services_1.IBufferService),
    __param(7, Services_2.ICoreBrowserService)
], RenderService);
exports.RenderService = RenderService;
//# sourceMappingURL=RenderService.js.map