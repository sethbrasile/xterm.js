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
exports.BufferDecorationRenderer = void 0;
const Lifecycle_1 = require("browser/Lifecycle");
const Services_1 = require("browser/services/Services");
const Lifecycle_2 = require("common/Lifecycle");
const Services_2 = require("common/services/Services");
let BufferDecorationRenderer = class BufferDecorationRenderer extends Lifecycle_2.Disposable {
    constructor(_screenElement, _bufferService, _decorationService, _renderService) {
        super();
        this._screenElement = _screenElement;
        this._bufferService = _bufferService;
        this._decorationService = _decorationService;
        this._renderService = _renderService;
        this._decorationElements = new Map();
        this._altBufferIsActive = false;
        this._dimensionsChanged = false;
        this._container = document.createElement('div');
        this._container.classList.add('xterm-decoration-container');
        this._screenElement.appendChild(this._container);
        this.register(this._renderService.onRenderedViewportChange(() => this._queueRefresh()));
        this.register(this._renderService.onDimensionsChange(() => {
            this._dimensionsChanged = true;
            this._queueRefresh();
        }));
        this.register((0, Lifecycle_1.addDisposableDomListener)(window, 'resize', () => this._queueRefresh()));
        this.register(this._bufferService.buffers.onBufferActivate(() => {
            this._altBufferIsActive = this._bufferService.buffer === this._bufferService.buffers.alt;
        }));
        this.register(this._decorationService.onDecorationRegistered(() => this._queueRefresh()));
        this.register(this._decorationService.onDecorationRemoved(decoration => this._removeDecoration(decoration)));
    }
    dispose() {
        this._container.remove();
        this._decorationElements.clear();
        super.dispose();
    }
    _queueRefresh() {
        if (this._animationFrame !== undefined) {
            return;
        }
        this._animationFrame = this._renderService.addRefreshCallback(() => {
            this.refreshDecorations();
            this._animationFrame = undefined;
        });
    }
    refreshDecorations() {
        for (const decoration of this._decorationService.decorations) {
            this._renderDecoration(decoration);
        }
        this._dimensionsChanged = false;
    }
    _renderDecoration(decoration) {
        this._refreshStyle(decoration);
        if (this._dimensionsChanged) {
            this._refreshXPosition(decoration);
        }
    }
    _createElement(decoration) {
        var _a;
        const element = document.createElement('div');
        element.classList.add('xterm-decoration');
        element.style.width = `${Math.round((decoration.options.width || 1) * this._renderService.dimensions.actualCellWidth)}px`;
        element.style.height = `${(decoration.options.height || 1) * this._renderService.dimensions.actualCellHeight}px`;
        element.style.top = `${(decoration.marker.line - this._bufferService.buffers.active.ydisp) * this._renderService.dimensions.actualCellHeight}px`;
        element.style.lineHeight = `${this._renderService.dimensions.actualCellHeight}px`;
        const x = (_a = decoration.options.x) !== null && _a !== void 0 ? _a : 0;
        if (x && x > this._bufferService.cols) {
            element.style.display = 'none';
        }
        this._refreshXPosition(decoration, element);
        return element;
    }
    _refreshStyle(decoration) {
        const line = decoration.marker.line - this._bufferService.buffers.active.ydisp;
        if (line < 0 || line >= this._bufferService.rows) {
            if (decoration.element) {
                decoration.element.style.display = 'none';
                decoration.onRenderEmitter.fire(decoration.element);
            }
        }
        else {
            let element = this._decorationElements.get(decoration);
            if (!element) {
                decoration.onDispose(() => this._removeDecoration(decoration));
                element = this._createElement(decoration);
                decoration.element = element;
                this._decorationElements.set(decoration, element);
                this._container.appendChild(element);
            }
            element.style.top = `${line * this._renderService.dimensions.actualCellHeight}px`;
            element.style.display = this._altBufferIsActive ? 'none' : 'block';
            decoration.onRenderEmitter.fire(element);
        }
    }
    _refreshXPosition(decoration, element = decoration.element) {
        var _a;
        if (!element) {
            return;
        }
        const x = (_a = decoration.options.x) !== null && _a !== void 0 ? _a : 0;
        if ((decoration.options.anchor || 'left') === 'right') {
            element.style.right = x ? `${x * this._renderService.dimensions.actualCellWidth}px` : '';
        }
        else {
            element.style.left = x ? `${x * this._renderService.dimensions.actualCellWidth}px` : '';
        }
    }
    _removeDecoration(decoration) {
        var _a;
        (_a = this._decorationElements.get(decoration)) === null || _a === void 0 ? void 0 : _a.remove();
        this._decorationElements.delete(decoration);
    }
};
BufferDecorationRenderer = __decorate([
    __param(1, Services_2.IBufferService),
    __param(2, Services_2.IDecorationService),
    __param(3, Services_1.IRenderService)
], BufferDecorationRenderer);
exports.BufferDecorationRenderer = BufferDecorationRenderer;
//# sourceMappingURL=BufferDecorationRenderer.js.map