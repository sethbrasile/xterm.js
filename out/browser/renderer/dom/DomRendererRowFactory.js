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
exports.DomRendererRowFactory = exports.CURSOR_STYLE_UNDERLINE_CLASS = exports.CURSOR_STYLE_BAR_CLASS = exports.CURSOR_STYLE_BLOCK_CLASS = exports.CURSOR_BLINK_CLASS = exports.CURSOR_CLASS = exports.STRIKETHROUGH_CLASS = exports.UNDERLINE_CLASS = exports.ITALIC_CLASS = exports.DIM_CLASS = exports.BOLD_CLASS = void 0;
const Constants_1 = require("browser/renderer/Constants");
const Constants_2 = require("common/buffer/Constants");
const CellData_1 = require("common/buffer/CellData");
const Services_1 = require("common/services/Services");
const Color_1 = require("common/Color");
const Services_2 = require("browser/services/Services");
const CharacterJoinerService_1 = require("browser/services/CharacterJoinerService");
const RendererUtils_1 = require("browser/renderer/RendererUtils");
const AttributeData_1 = require("common/buffer/AttributeData");
exports.BOLD_CLASS = 'xterm-bold';
exports.DIM_CLASS = 'xterm-dim';
exports.ITALIC_CLASS = 'xterm-italic';
exports.UNDERLINE_CLASS = 'xterm-underline';
exports.STRIKETHROUGH_CLASS = 'xterm-strikethrough';
exports.CURSOR_CLASS = 'xterm-cursor';
exports.CURSOR_BLINK_CLASS = 'xterm-cursor-blink';
exports.CURSOR_STYLE_BLOCK_CLASS = 'xterm-cursor-block';
exports.CURSOR_STYLE_BAR_CLASS = 'xterm-cursor-bar';
exports.CURSOR_STYLE_UNDERLINE_CLASS = 'xterm-cursor-underline';
let DomRendererRowFactory = class DomRendererRowFactory {
    constructor(_document, _colors, _characterJoinerService, _optionsService, _coreBrowserService, _coreService, _decorationService) {
        this._document = _document;
        this._colors = _colors;
        this._characterJoinerService = _characterJoinerService;
        this._optionsService = _optionsService;
        this._coreBrowserService = _coreBrowserService;
        this._coreService = _coreService;
        this._decorationService = _decorationService;
        this._workCell = new CellData_1.CellData();
        this._columnSelectMode = false;
    }
    setColors(colors) {
        this._colors = colors;
    }
    onSelectionChanged(start, end, columnSelectMode) {
        this._selectionStart = start;
        this._selectionEnd = end;
        this._columnSelectMode = columnSelectMode;
    }
    createRow(lineData, row, isCursorRow, cursorStyle, cursorX, cursorBlink, cellWidth, cols) {
        const fragment = this._document.createDocumentFragment();
        const joinedRanges = this._characterJoinerService.getJoinedCharacters(row);
        let lineLength = 0;
        for (let x = Math.min(lineData.length, cols) - 1; x >= 0; x--) {
            if (lineData.loadCell(x, this._workCell).getCode() !== Constants_2.NULL_CELL_CODE || (isCursorRow && x === cursorX)) {
                lineLength = x + 1;
                break;
            }
        }
        for (let x = 0; x < lineLength; x++) {
            lineData.loadCell(x, this._workCell);
            let width = this._workCell.getWidth();
            if (width === 0) {
                continue;
            }
            let isJoined = false;
            let lastCharX = x;
            let cell = this._workCell;
            if (joinedRanges.length > 0 && x === joinedRanges[0][0]) {
                isJoined = true;
                const range = joinedRanges.shift();
                cell = new CharacterJoinerService_1.JoinedCellData(this._workCell, lineData.translateToString(true, range[0], range[1]), range[1] - range[0]);
                lastCharX = range[1] - 1;
                width = cell.getWidth();
            }
            const charElement = this._document.createElement('span');
            if (width > 1) {
                charElement.style.width = `${cellWidth * width}px`;
            }
            if (isJoined) {
                charElement.style.display = 'inline';
                if (cursorX >= x && cursorX <= lastCharX) {
                    cursorX = x;
                }
            }
            if (!this._coreService.isCursorHidden && isCursorRow && x === cursorX) {
                charElement.classList.add(exports.CURSOR_CLASS);
                if (cursorBlink) {
                    charElement.classList.add(exports.CURSOR_BLINK_CLASS);
                }
                switch (cursorStyle) {
                    case 'bar':
                        charElement.classList.add(exports.CURSOR_STYLE_BAR_CLASS);
                        break;
                    case 'underline':
                        charElement.classList.add(exports.CURSOR_STYLE_UNDERLINE_CLASS);
                        break;
                    default:
                        charElement.classList.add(exports.CURSOR_STYLE_BLOCK_CLASS);
                        break;
                }
            }
            if (cell.isBold()) {
                charElement.classList.add(exports.BOLD_CLASS);
            }
            if (cell.isItalic()) {
                charElement.classList.add(exports.ITALIC_CLASS);
            }
            if (cell.isDim()) {
                charElement.classList.add(exports.DIM_CLASS);
            }
            if (cell.isInvisible()) {
                charElement.textContent = Constants_2.WHITESPACE_CELL_CHAR;
            }
            else {
                charElement.textContent = cell.getChars() || Constants_2.WHITESPACE_CELL_CHAR;
            }
            if (cell.isUnderline()) {
                charElement.classList.add(`${exports.UNDERLINE_CLASS}-${cell.extended.underlineStyle}`);
                if (charElement.textContent === ' ') {
                    charElement.innerHTML = '&nbsp;';
                }
                if (!cell.isUnderlineColorDefault()) {
                    if (cell.isUnderlineColorRGB()) {
                        charElement.style.textDecorationColor = `rgb(${AttributeData_1.AttributeData.toColorRGB(cell.getUnderlineColor()).join(',')})`;
                    }
                    else {
                        let fg = cell.getUnderlineColor();
                        if (this._optionsService.rawOptions.drawBoldTextInBrightColors && cell.isBold() && fg < 8) {
                            fg += 8;
                        }
                        charElement.style.textDecorationColor = this._colors.ansi[fg].css;
                    }
                }
            }
            if (cell.isStrikethrough()) {
                charElement.classList.add(exports.STRIKETHROUGH_CLASS);
            }
            let fg = cell.getFgColor();
            let fgColorMode = cell.getFgColorMode();
            let bg = cell.getBgColor();
            let bgColorMode = cell.getBgColorMode();
            const isInverse = !!cell.isInverse();
            if (isInverse) {
                const temp = fg;
                fg = bg;
                bg = temp;
                const temp2 = fgColorMode;
                fgColorMode = bgColorMode;
                bgColorMode = temp2;
            }
            let bgOverride;
            let fgOverride;
            let isTop = false;
            this._decorationService.forEachDecorationAtCell(x, row, undefined, d => {
                if (d.options.layer !== 'top' && isTop) {
                    return;
                }
                if (d.backgroundColorRGB) {
                    bgColorMode = 50331648;
                    bg = d.backgroundColorRGB.rgba >> 8 & 0xFFFFFF;
                    bgOverride = d.backgroundColorRGB;
                }
                if (d.foregroundColorRGB) {
                    fgColorMode = 50331648;
                    fg = d.foregroundColorRGB.rgba >> 8 & 0xFFFFFF;
                    fgOverride = d.foregroundColorRGB;
                }
                isTop = d.options.layer === 'top';
            });
            const isInSelection = this._isCellInSelection(x, row);
            if (!isTop) {
                if (this._colors.selectionForeground && isInSelection) {
                    fgColorMode = 50331648;
                    fg = this._colors.selectionForeground.rgba >> 8 & 0xFFFFFF;
                    fgOverride = this._colors.selectionForeground;
                }
            }
            if (isInSelection) {
                bgOverride = this._coreBrowserService.isFocused ? this._colors.selectionBackgroundOpaque : this._colors.selectionInactiveBackgroundOpaque;
                isTop = true;
            }
            if (isTop) {
                charElement.classList.add(`xterm-decoration-top`);
            }
            let resolvedBg;
            switch (bgColorMode) {
                case 16777216:
                case 33554432:
                    resolvedBg = this._colors.ansi[bg];
                    charElement.classList.add(`xterm-bg-${bg}`);
                    break;
                case 50331648:
                    resolvedBg = Color_1.rgba.toColor(bg >> 16, bg >> 8 & 0xFF, bg & 0xFF);
                    this._addStyle(charElement, `background-color:#${padStart((bg >>> 0).toString(16), '0', 6)}`);
                    break;
                case 0:
                default:
                    if (isInverse) {
                        resolvedBg = this._colors.foreground;
                        charElement.classList.add(`xterm-bg-${Constants_1.INVERTED_DEFAULT_COLOR}`);
                    }
                    else {
                        resolvedBg = this._colors.background;
                    }
            }
            if (!bgOverride) {
                if (cell.isDim()) {
                    bgOverride = Color_1.color.multiplyOpacity(resolvedBg, 0.5);
                }
            }
            switch (fgColorMode) {
                case 16777216:
                case 33554432:
                    if (cell.isBold() && fg < 8 && this._optionsService.rawOptions.drawBoldTextInBrightColors) {
                        fg += 8;
                    }
                    if (!this._applyMinimumContrast(charElement, resolvedBg, this._colors.ansi[fg], cell, bgOverride, undefined)) {
                        charElement.classList.add(`xterm-fg-${fg}`);
                    }
                    break;
                case 50331648:
                    const color = Color_1.rgba.toColor((fg >> 16) & 0xFF, (fg >> 8) & 0xFF, (fg) & 0xFF);
                    if (!this._applyMinimumContrast(charElement, resolvedBg, color, cell, bgOverride, fgOverride)) {
                        this._addStyle(charElement, `color:#${padStart(fg.toString(16), '0', 6)}`);
                    }
                    break;
                case 0:
                default:
                    if (!this._applyMinimumContrast(charElement, resolvedBg, this._colors.foreground, cell, bgOverride, undefined)) {
                        if (isInverse) {
                            charElement.classList.add(`xterm-fg-${Constants_1.INVERTED_DEFAULT_COLOR}`);
                        }
                    }
            }
            fragment.appendChild(charElement);
            x = lastCharX;
        }
        return fragment;
    }
    _applyMinimumContrast(element, bg, fg, cell, bgOverride, fgOverride) {
        if (this._optionsService.rawOptions.minimumContrastRatio === 1 || (0, RendererUtils_1.excludeFromContrastRatioDemands)(cell.getCode())) {
            return false;
        }
        let adjustedColor = undefined;
        if (!bgOverride && !fgOverride) {
            adjustedColor = this._colors.contrastCache.getColor(bg.rgba, fg.rgba);
        }
        if (adjustedColor === undefined) {
            adjustedColor = Color_1.color.ensureContrastRatio(bgOverride || bg, fgOverride || fg, this._optionsService.rawOptions.minimumContrastRatio);
            this._colors.contrastCache.setColor((bgOverride || bg).rgba, (fgOverride || fg).rgba, adjustedColor !== null && adjustedColor !== void 0 ? adjustedColor : null);
        }
        if (adjustedColor) {
            this._addStyle(element, `color:${adjustedColor.css}`);
            return true;
        }
        return false;
    }
    _addStyle(element, style) {
        element.setAttribute('style', `${element.getAttribute('style') || ''}${style};`);
    }
    _isCellInSelection(x, y) {
        const start = this._selectionStart;
        const end = this._selectionEnd;
        if (!start || !end) {
            return false;
        }
        if (this._columnSelectMode) {
            if (start[0] <= end[0]) {
                return x >= start[0] && y >= start[1] &&
                    x < end[0] && y <= end[1];
            }
            return x < start[0] && y >= start[1] &&
                x >= end[0] && y <= end[1];
        }
        return (y > start[1] && y < end[1]) ||
            (start[1] === end[1] && y === start[1] && x >= start[0] && x < end[0]) ||
            (start[1] < end[1] && y === end[1] && x < end[0]) ||
            (start[1] < end[1] && y === start[1] && x >= start[0]);
    }
};
DomRendererRowFactory = __decorate([
    __param(2, Services_2.ICharacterJoinerService),
    __param(3, Services_1.IOptionsService),
    __param(4, Services_2.ICoreBrowserService),
    __param(5, Services_1.ICoreService),
    __param(6, Services_1.IDecorationService)
], DomRendererRowFactory);
exports.DomRendererRowFactory = DomRendererRowFactory;
function padStart(text, padChar, length) {
    while (text.length < length) {
        text = padChar + text;
    }
    return text;
}
//# sourceMappingURL=DomRendererRowFactory.js.map