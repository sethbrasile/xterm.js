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
exports.Viewport = void 0;
const Lifecycle_1 = require("common/Lifecycle");
const Lifecycle_2 = require("browser/Lifecycle");
const Services_1 = require("browser/services/Services");
const Services_2 = require("common/services/Services");
const FALLBACK_SCROLL_BAR_WIDTH = 15;
let Viewport = class Viewport extends Lifecycle_1.Disposable {
    constructor(_scrollLines, _viewportElement, _scrollArea, _element, _bufferService, _optionsService, _charSizeService, _renderService, _coreBrowserService) {
        super();
        this._scrollLines = _scrollLines;
        this._viewportElement = _viewportElement;
        this._scrollArea = _scrollArea;
        this._element = _element;
        this._bufferService = _bufferService;
        this._optionsService = _optionsService;
        this._charSizeService = _charSizeService;
        this._renderService = _renderService;
        this._coreBrowserService = _coreBrowserService;
        this.scrollBarWidth = 0;
        this._currentRowHeight = 0;
        this._currentScaledCellHeight = 0;
        this._lastRecordedBufferLength = 0;
        this._lastRecordedViewportHeight = 0;
        this._lastRecordedBufferHeight = 0;
        this._lastTouchY = 0;
        this._lastScrollTop = 0;
        this._wheelPartialScroll = 0;
        this._refreshAnimationFrame = null;
        this._ignoreNextScrollEvent = false;
        this._smoothScrollState = {
            startTime: 0,
            origin: -1,
            target: -1
        };
        this.scrollBarWidth = (this._viewportElement.offsetWidth - this._scrollArea.offsetWidth) || FALLBACK_SCROLL_BAR_WIDTH;
        this.register((0, Lifecycle_2.addDisposableDomListener)(this._viewportElement, 'scroll', this._onScroll.bind(this)));
        this._activeBuffer = this._bufferService.buffer;
        this.register(this._bufferService.buffers.onBufferActivate(e => this._activeBuffer = e.activeBuffer));
        this._renderDimensions = this._renderService.dimensions;
        this.register(this._renderService.onDimensionsChange(e => this._renderDimensions = e));
        setTimeout(() => this.syncScrollArea(), 0);
    }
    onThemeChange(colors) {
        this._viewportElement.style.backgroundColor = colors.background.css;
    }
    _refresh(immediate) {
        if (immediate) {
            this._innerRefresh();
            if (this._refreshAnimationFrame !== null) {
                this._coreBrowserService.window.cancelAnimationFrame(this._refreshAnimationFrame);
            }
            return;
        }
        if (this._refreshAnimationFrame === null) {
            this._refreshAnimationFrame = this._coreBrowserService.window.requestAnimationFrame(() => this._innerRefresh());
        }
    }
    _innerRefresh() {
        if (this._charSizeService.height > 0) {
            this._currentRowHeight = this._renderService.dimensions.scaledCellHeight / this._coreBrowserService.dpr;
            this._currentScaledCellHeight = this._renderService.dimensions.scaledCellHeight;
            this._lastRecordedViewportHeight = this._viewportElement.offsetHeight;
            const newBufferHeight = Math.round(this._currentRowHeight * this._lastRecordedBufferLength) + (this._lastRecordedViewportHeight - this._renderService.dimensions.canvasHeight);
            if (this._lastRecordedBufferHeight !== newBufferHeight) {
                this._lastRecordedBufferHeight = newBufferHeight;
                this._scrollArea.style.height = this._lastRecordedBufferHeight + 'px';
            }
        }
        const scrollTop = this._bufferService.buffer.ydisp * this._currentRowHeight;
        if (this._viewportElement.scrollTop !== scrollTop) {
            this._ignoreNextScrollEvent = true;
            this._viewportElement.scrollTop = scrollTop;
        }
        this._refreshAnimationFrame = null;
    }
    syncScrollArea(immediate = false) {
        if (this._lastRecordedBufferLength !== this._bufferService.buffer.lines.length) {
            this._lastRecordedBufferLength = this._bufferService.buffer.lines.length;
            this._refresh(immediate);
            return;
        }
        if (this._lastRecordedViewportHeight !== this._renderService.dimensions.canvasHeight) {
            this._refresh(immediate);
            return;
        }
        if (this._lastScrollTop !== this._activeBuffer.ydisp * this._currentRowHeight) {
            this._refresh(immediate);
            return;
        }
        if (this._renderDimensions.scaledCellHeight !== this._currentScaledCellHeight) {
            this._refresh(immediate);
            return;
        }
    }
    _onScroll(ev) {
        this._lastScrollTop = this._viewportElement.scrollTop;
        if (!this._viewportElement.offsetParent) {
            return;
        }
        if (this._ignoreNextScrollEvent) {
            this._ignoreNextScrollEvent = false;
            this._scrollLines(0);
            return;
        }
        const newRow = Math.round(this._lastScrollTop / this._currentRowHeight);
        const diff = newRow - this._bufferService.buffer.ydisp;
        this._scrollLines(diff);
    }
    _smoothScroll() {
        if (this._isDisposed || this._smoothScrollState.origin === -1 || this._smoothScrollState.target === -1) {
            return;
        }
        const percent = this._smoothScrollPercent();
        this._viewportElement.scrollTop = this._smoothScrollState.origin + Math.round(percent * (this._smoothScrollState.target - this._smoothScrollState.origin));
        if (percent < 1) {
            this._coreBrowserService.window.requestAnimationFrame(() => this._smoothScroll());
        }
        else {
            this._clearSmoothScrollState();
        }
    }
    _smoothScrollPercent() {
        if (!this._optionsService.rawOptions.smoothScrollDuration || !this._smoothScrollState.startTime) {
            return 1;
        }
        return Math.max(Math.min((Date.now() - this._smoothScrollState.startTime) / this._optionsService.rawOptions.smoothScrollDuration, 1), 0);
    }
    _clearSmoothScrollState() {
        this._smoothScrollState.startTime = 0;
        this._smoothScrollState.origin = -1;
        this._smoothScrollState.target = -1;
    }
    _bubbleScroll(ev, amount) {
        const scrollPosFromTop = this._viewportElement.scrollTop + this._lastRecordedViewportHeight;
        if ((amount < 0 && this._viewportElement.scrollTop !== 0) ||
            (amount > 0 && scrollPosFromTop < this._lastRecordedBufferHeight)) {
            if (ev.cancelable) {
                ev.preventDefault();
            }
            return false;
        }
        return true;
    }
    onWheel(ev) {
        const amount = this._getPixelsScrolled(ev);
        if (amount === 0) {
            return false;
        }
        if (!this._optionsService.rawOptions.smoothScrollDuration) {
            this._viewportElement.scrollTop += amount;
        }
        else {
            this._smoothScrollState.startTime = Date.now();
            if (this._smoothScrollPercent() < 1) {
                this._smoothScrollState.origin = this._viewportElement.scrollTop;
                if (this._smoothScrollState.target === -1) {
                    this._smoothScrollState.target = this._viewportElement.scrollTop + amount;
                }
                else {
                    this._smoothScrollState.target += amount;
                }
                this._smoothScrollState.target = Math.max(Math.min(this._smoothScrollState.target, this._viewportElement.scrollHeight), 0);
                this._smoothScroll();
            }
            else {
                this._clearSmoothScrollState();
            }
        }
        return this._bubbleScroll(ev, amount);
    }
    _getPixelsScrolled(ev) {
        if (ev.deltaY === 0 || ev.shiftKey) {
            return 0;
        }
        let amount = this._applyScrollModifier(ev.deltaY, ev);
        if (ev.deltaMode === WheelEvent.DOM_DELTA_LINE) {
            amount *= this._currentRowHeight;
        }
        else if (ev.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
            amount *= this._currentRowHeight * this._bufferService.rows;
        }
        return amount;
    }
    getLinesScrolled(ev) {
        if (ev.deltaY === 0 || ev.shiftKey) {
            return 0;
        }
        let amount = this._applyScrollModifier(ev.deltaY, ev);
        if (ev.deltaMode === WheelEvent.DOM_DELTA_PIXEL) {
            amount /= this._currentRowHeight + 0.0;
            this._wheelPartialScroll += amount;
            amount = Math.floor(Math.abs(this._wheelPartialScroll)) * (this._wheelPartialScroll > 0 ? 1 : -1);
            this._wheelPartialScroll %= 1;
        }
        else if (ev.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
            amount *= this._bufferService.rows;
        }
        return amount;
    }
    _applyScrollModifier(amount, ev) {
        const modifier = this._optionsService.rawOptions.fastScrollModifier;
        if ((modifier === 'alt' && ev.altKey) ||
            (modifier === 'ctrl' && ev.ctrlKey) ||
            (modifier === 'shift' && ev.shiftKey)) {
            return amount * this._optionsService.rawOptions.fastScrollSensitivity * this._optionsService.rawOptions.scrollSensitivity;
        }
        return amount * this._optionsService.rawOptions.scrollSensitivity;
    }
    onTouchStart(ev) {
        this._lastTouchY = ev.touches[0].pageY;
    }
    onTouchMove(ev) {
        const deltaY = this._lastTouchY - ev.touches[0].pageY;
        this._lastTouchY = ev.touches[0].pageY;
        if (deltaY === 0) {
            return false;
        }
        this._viewportElement.scrollTop += deltaY;
        return this._bubbleScroll(ev, deltaY);
    }
};
Viewport = __decorate([
    __param(4, Services_2.IBufferService),
    __param(5, Services_2.IOptionsService),
    __param(6, Services_1.ICharSizeService),
    __param(7, Services_1.IRenderService),
    __param(8, Services_1.ICoreBrowserService)
], Viewport);
exports.Viewport = Viewport;
//# sourceMappingURL=Viewport.js.map