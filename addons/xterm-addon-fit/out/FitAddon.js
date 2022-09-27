"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FitAddon = void 0;
const MINIMUM_COLS = 2;
const MINIMUM_ROWS = 1;
class FitAddon {
    constructor() { }
    activate(terminal) {
        this._terminal = terminal;
    }
    dispose() { }
    fit() {
        const dims = this.proposeDimensions();
        if (!dims || !this._terminal || isNaN(dims.cols) || isNaN(dims.rows)) {
            return;
        }
        const core = this._terminal._core;
        if (this._terminal.rows !== dims.rows || this._terminal.cols !== dims.cols) {
            core._renderService.clear();
            this._terminal.resize(dims.cols, dims.rows);
        }
    }
    proposeDimensions() {
        if (!this._terminal) {
            return undefined;
        }
        if (!this._terminal.element || !this._terminal.element.parentElement) {
            return undefined;
        }
        const core = this._terminal._core;
        if (core._renderService.dimensions.actualCellWidth === 0 || core._renderService.dimensions.actualCellHeight === 0) {
            return undefined;
        }
        const scrollbarWidth = this._terminal.options.scrollback === 0 ?
            0 : core.viewport.scrollBarWidth;
        const parentElementStyle = window.getComputedStyle(this._terminal.element.parentElement);
        const parentElementHeight = parseInt(parentElementStyle.getPropertyValue('height'));
        const parentElementWidth = Math.max(0, parseInt(parentElementStyle.getPropertyValue('width')));
        const elementStyle = window.getComputedStyle(this._terminal.element);
        const elementPadding = {
            top: parseInt(elementStyle.getPropertyValue('padding-top')),
            bottom: parseInt(elementStyle.getPropertyValue('padding-bottom')),
            right: parseInt(elementStyle.getPropertyValue('padding-right')),
            left: parseInt(elementStyle.getPropertyValue('padding-left'))
        };
        const elementPaddingVer = elementPadding.top + elementPadding.bottom;
        const elementPaddingHor = elementPadding.right + elementPadding.left;
        const availableHeight = parentElementHeight - elementPaddingVer;
        const availableWidth = parentElementWidth - elementPaddingHor - scrollbarWidth;
        const geometry = {
            cols: Math.max(MINIMUM_COLS, Math.floor(availableWidth / core._renderService.dimensions.actualCellWidth)),
            rows: Math.max(MINIMUM_ROWS, Math.floor(availableHeight / core._renderService.dimensions.actualCellHeight))
        };
        return geometry;
    }
}
exports.FitAddon = FitAddon;
//# sourceMappingURL=FitAddon.js.map