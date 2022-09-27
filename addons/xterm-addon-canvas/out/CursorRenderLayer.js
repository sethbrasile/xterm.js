"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CursorRenderLayer = void 0;
const BaseRenderLayer_1 = require("./BaseRenderLayer");
const CellData_1 = require("common/buffer/CellData");
const BLINK_INTERVAL = 600;
class CursorRenderLayer extends BaseRenderLayer_1.BaseRenderLayer {
    constructor(container, zIndex, colors, rendererId, _onRequestRedraw, bufferService, optionsService, _coreService, coreBrowserService, decorationService) {
        super(container, 'cursor', zIndex, true, colors, rendererId, bufferService, optionsService, decorationService, coreBrowserService);
        this._onRequestRedraw = _onRequestRedraw;
        this._coreService = _coreService;
        this._cell = new CellData_1.CellData();
        this._state = {
            x: 0,
            y: 0,
            isFocused: false,
            style: '',
            width: 0
        };
        this._cursorRenderers = {
            'bar': this._renderBarCursor.bind(this),
            'block': this._renderBlockCursor.bind(this),
            'underline': this._renderUnderlineCursor.bind(this)
        };
    }
    dispose() {
        if (this._cursorBlinkStateManager) {
            this._cursorBlinkStateManager.dispose();
            this._cursorBlinkStateManager = undefined;
        }
        super.dispose();
    }
    resize(dim) {
        super.resize(dim);
        this._state = {
            x: 0,
            y: 0,
            isFocused: false,
            style: '',
            width: 0
        };
    }
    reset() {
        var _a;
        this._clearCursor();
        (_a = this._cursorBlinkStateManager) === null || _a === void 0 ? void 0 : _a.restartBlinkAnimation();
        this.onOptionsChanged();
    }
    onBlur() {
        var _a;
        (_a = this._cursorBlinkStateManager) === null || _a === void 0 ? void 0 : _a.pause();
        this._onRequestRedraw.fire({ start: this._bufferService.buffer.y, end: this._bufferService.buffer.y });
    }
    onFocus() {
        var _a;
        (_a = this._cursorBlinkStateManager) === null || _a === void 0 ? void 0 : _a.resume();
        this._onRequestRedraw.fire({ start: this._bufferService.buffer.y, end: this._bufferService.buffer.y });
    }
    onOptionsChanged() {
        var _a;
        if (this._optionsService.rawOptions.cursorBlink) {
            if (!this._cursorBlinkStateManager) {
                this._cursorBlinkStateManager = new CursorBlinkStateManager(this._coreBrowserService.isFocused, () => {
                    this._render(true);
                }, this._coreBrowserService);
            }
        }
        else {
            (_a = this._cursorBlinkStateManager) === null || _a === void 0 ? void 0 : _a.dispose();
            this._cursorBlinkStateManager = undefined;
        }
        this._onRequestRedraw.fire({ start: this._bufferService.buffer.y, end: this._bufferService.buffer.y });
    }
    onCursorMove() {
        var _a;
        (_a = this._cursorBlinkStateManager) === null || _a === void 0 ? void 0 : _a.restartBlinkAnimation();
    }
    onGridChanged(startRow, endRow) {
        if (!this._cursorBlinkStateManager || this._cursorBlinkStateManager.isPaused) {
            this._render(false);
        }
        else {
            this._cursorBlinkStateManager.restartBlinkAnimation();
        }
    }
    _render(triggeredByAnimationFrame) {
        if (!this._coreService.isCursorInitialized || this._coreService.isCursorHidden) {
            this._clearCursor();
            return;
        }
        const cursorY = this._bufferService.buffer.ybase + this._bufferService.buffer.y;
        const viewportRelativeCursorY = cursorY - this._bufferService.buffer.ydisp;
        if (viewportRelativeCursorY < 0 || viewportRelativeCursorY >= this._bufferService.rows) {
            this._clearCursor();
            return;
        }
        const cursorX = Math.min(this._bufferService.buffer.x, this._bufferService.cols - 1);
        this._bufferService.buffer.lines.get(cursorY).loadCell(cursorX, this._cell);
        if (this._cell.content === undefined) {
            return;
        }
        if (!this._coreBrowserService.isFocused) {
            this._clearCursor();
            this._ctx.save();
            this._ctx.fillStyle = this._colors.cursor.css;
            const cursorStyle = this._optionsService.rawOptions.cursorStyle;
            if (cursorStyle && cursorStyle !== 'block') {
                this._cursorRenderers[cursorStyle](cursorX, viewportRelativeCursorY, this._cell);
            }
            else {
                this._renderBlurCursor(cursorX, viewportRelativeCursorY, this._cell);
            }
            this._ctx.restore();
            this._state.x = cursorX;
            this._state.y = viewportRelativeCursorY;
            this._state.isFocused = false;
            this._state.style = cursorStyle;
            this._state.width = this._cell.getWidth();
            return;
        }
        if (this._cursorBlinkStateManager && !this._cursorBlinkStateManager.isCursorVisible) {
            this._clearCursor();
            return;
        }
        if (this._state) {
            if (this._state.x === cursorX &&
                this._state.y === viewportRelativeCursorY &&
                this._state.isFocused === this._coreBrowserService.isFocused &&
                this._state.style === this._optionsService.rawOptions.cursorStyle &&
                this._state.width === this._cell.getWidth()) {
                return;
            }
            this._clearCursor();
        }
        this._ctx.save();
        this._cursorRenderers[this._optionsService.rawOptions.cursorStyle || 'block'](cursorX, viewportRelativeCursorY, this._cell);
        this._ctx.restore();
        this._state.x = cursorX;
        this._state.y = viewportRelativeCursorY;
        this._state.isFocused = false;
        this._state.style = this._optionsService.rawOptions.cursorStyle;
        this._state.width = this._cell.getWidth();
    }
    _clearCursor() {
        if (this._state) {
            if (this._coreBrowserService.dpr < 1) {
                this._clearAll();
            }
            else {
                this._clearCells(this._state.x, this._state.y, this._state.width, 1);
            }
            this._state = {
                x: 0,
                y: 0,
                isFocused: false,
                style: '',
                width: 0
            };
        }
    }
    _renderBarCursor(x, y, cell) {
        this._ctx.save();
        this._ctx.fillStyle = this._colors.cursor.css;
        this._fillLeftLineAtCell(x, y, this._optionsService.rawOptions.cursorWidth);
        this._ctx.restore();
    }
    _renderBlockCursor(x, y, cell) {
        this._ctx.save();
        this._ctx.fillStyle = this._colors.cursor.css;
        this._fillCells(x, y, cell.getWidth(), 1);
        this._ctx.fillStyle = this._colors.cursorAccent.css;
        this._fillCharTrueColor(cell, x, y);
        this._ctx.restore();
    }
    _renderUnderlineCursor(x, y, cell) {
        this._ctx.save();
        this._ctx.fillStyle = this._colors.cursor.css;
        this._fillBottomLineAtCells(x, y);
        this._ctx.restore();
    }
    _renderBlurCursor(x, y, cell) {
        this._ctx.save();
        this._ctx.strokeStyle = this._colors.cursor.css;
        this._strokeRectAtCell(x, y, cell.getWidth(), 1);
        this._ctx.restore();
    }
}
exports.CursorRenderLayer = CursorRenderLayer;
class CursorBlinkStateManager {
    constructor(isFocused, _renderCallback, _coreBrowserService) {
        this._renderCallback = _renderCallback;
        this._coreBrowserService = _coreBrowserService;
        this.isCursorVisible = true;
        if (isFocused) {
            this._restartInterval();
        }
    }
    get isPaused() { return !(this._blinkStartTimeout || this._blinkInterval); }
    dispose() {
        if (this._blinkInterval) {
            this._coreBrowserService.window.clearInterval(this._blinkInterval);
            this._blinkInterval = undefined;
        }
        if (this._blinkStartTimeout) {
            this._coreBrowserService.window.clearTimeout(this._blinkStartTimeout);
            this._blinkStartTimeout = undefined;
        }
        if (this._animationFrame) {
            this._coreBrowserService.window.cancelAnimationFrame(this._animationFrame);
            this._animationFrame = undefined;
        }
    }
    restartBlinkAnimation() {
        if (this.isPaused) {
            return;
        }
        this._animationTimeRestarted = Date.now();
        this.isCursorVisible = true;
        if (!this._animationFrame) {
            this._animationFrame = this._coreBrowserService.window.requestAnimationFrame(() => {
                this._renderCallback();
                this._animationFrame = undefined;
            });
        }
    }
    _restartInterval(timeToStart = BLINK_INTERVAL) {
        if (this._blinkInterval) {
            this._coreBrowserService.window.clearInterval(this._blinkInterval);
            this._blinkInterval = undefined;
        }
        this._blinkStartTimeout = this._coreBrowserService.window.setTimeout(() => {
            if (this._animationTimeRestarted) {
                const time = BLINK_INTERVAL - (Date.now() - this._animationTimeRestarted);
                this._animationTimeRestarted = undefined;
                if (time > 0) {
                    this._restartInterval(time);
                    return;
                }
            }
            this.isCursorVisible = false;
            this._animationFrame = this._coreBrowserService.window.requestAnimationFrame(() => {
                this._renderCallback();
                this._animationFrame = undefined;
            });
            this._blinkInterval = this._coreBrowserService.window.setInterval(() => {
                if (this._animationTimeRestarted) {
                    const time = BLINK_INTERVAL - (Date.now() - this._animationTimeRestarted);
                    this._animationTimeRestarted = undefined;
                    this._restartInterval(time);
                    return;
                }
                this.isCursorVisible = !this.isCursorVisible;
                this._animationFrame = this._coreBrowserService.window.requestAnimationFrame(() => {
                    this._renderCallback();
                    this._animationFrame = undefined;
                });
            }, BLINK_INTERVAL);
        }, timeToStart);
    }
    pause() {
        this.isCursorVisible = true;
        if (this._blinkInterval) {
            this._coreBrowserService.window.clearInterval(this._blinkInterval);
            this._blinkInterval = undefined;
        }
        if (this._blinkStartTimeout) {
            this._coreBrowserService.window.clearTimeout(this._blinkStartTimeout);
            this._blinkStartTimeout = undefined;
        }
        if (this._animationFrame) {
            this._coreBrowserService.window.cancelAnimationFrame(this._animationFrame);
            this._animationFrame = undefined;
        }
    }
    resume() {
        this.pause();
        this._animationTimeRestarted = undefined;
        this._restartInterval();
        this.restartBlinkAnimation();
    }
}
//# sourceMappingURL=CursorRenderLayer.js.map