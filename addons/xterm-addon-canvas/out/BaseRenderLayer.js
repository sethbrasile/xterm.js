"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRenderLayer = void 0;
const Constants_1 = require("common/buffer/Constants");
const Constants_2 = require("browser/renderer/Constants");
const CharAtlasCache_1 = require("./atlas/CharAtlasCache");
const AttributeData_1 = require("common/buffer/AttributeData");
const RendererUtils_1 = require("browser/renderer/RendererUtils");
const Color_1 = require("common/Color");
const Dom_1 = require("browser/Dom");
const CustomGlyphs_1 = require("browser/renderer/CustomGlyphs");
class BaseRenderLayer {
    constructor(_container, id, zIndex, _alpha, _colors, _rendererId, _bufferService, _optionsService, _decorationService, _coreBrowserService) {
        this._container = _container;
        this._alpha = _alpha;
        this._colors = _colors;
        this._rendererId = _rendererId;
        this._bufferService = _bufferService;
        this._optionsService = _optionsService;
        this._decorationService = _decorationService;
        this._coreBrowserService = _coreBrowserService;
        this._scaledCharWidth = 0;
        this._scaledCharHeight = 0;
        this._scaledCellWidth = 0;
        this._scaledCellHeight = 0;
        this._scaledCharLeft = 0;
        this._scaledCharTop = 0;
        this._columnSelectMode = false;
        this._currentGlyphIdentifier = {
            chars: '',
            code: 0,
            bg: 0,
            fg: 0,
            bold: false,
            dim: false,
            italic: false
        };
        this._canvas = document.createElement('canvas');
        this._canvas.classList.add(`xterm-${id}-layer`);
        this._canvas.style.zIndex = zIndex.toString();
        this._initCanvas();
        this._container.appendChild(this._canvas);
    }
    get canvas() { return this._canvas; }
    dispose() {
        var _a;
        (0, Dom_1.removeElementFromParent)(this._canvas);
        (_a = this._charAtlas) === null || _a === void 0 ? void 0 : _a.dispose();
    }
    _initCanvas() {
        this._ctx = (0, RendererUtils_1.throwIfFalsy)(this._canvas.getContext('2d', { alpha: this._alpha }));
        if (!this._alpha) {
            this._clearAll();
        }
    }
    onOptionsChanged() { }
    onBlur() { }
    onFocus() { }
    onCursorMove() { }
    onGridChanged(startRow, endRow) { }
    onSelectionChanged(start, end, columnSelectMode = false) {
        this._selectionStart = start;
        this._selectionEnd = end;
        this._columnSelectMode = columnSelectMode;
    }
    setColors(colorSet) {
        this._refreshCharAtlas(colorSet);
    }
    _setTransparency(alpha) {
        if (alpha === this._alpha) {
            return;
        }
        const oldCanvas = this._canvas;
        this._alpha = alpha;
        this._canvas = this._canvas.cloneNode();
        this._initCanvas();
        this._container.replaceChild(this._canvas, oldCanvas);
        this._refreshCharAtlas(this._colors);
        this.onGridChanged(0, this._bufferService.rows - 1);
    }
    _refreshCharAtlas(colorSet) {
        if (this._scaledCharWidth <= 0 && this._scaledCharHeight <= 0) {
            return;
        }
        this._charAtlas = (0, CharAtlasCache_1.acquireCharAtlas)(this._optionsService.rawOptions, this._rendererId, colorSet, this._scaledCharWidth, this._scaledCharHeight, this._coreBrowserService.dpr);
        this._charAtlas.warmUp();
    }
    resize(dim) {
        this._scaledCellWidth = dim.scaledCellWidth;
        this._scaledCellHeight = dim.scaledCellHeight;
        this._scaledCharWidth = dim.scaledCharWidth;
        this._scaledCharHeight = dim.scaledCharHeight;
        this._scaledCharLeft = dim.scaledCharLeft;
        this._scaledCharTop = dim.scaledCharTop;
        this._canvas.width = dim.scaledCanvasWidth;
        this._canvas.height = dim.scaledCanvasHeight;
        this._canvas.style.width = `${dim.canvasWidth}px`;
        this._canvas.style.height = `${dim.canvasHeight}px`;
        if (!this._alpha) {
            this._clearAll();
        }
        this._refreshCharAtlas(this._colors);
    }
    clearTextureAtlas() {
        var _a;
        (_a = this._charAtlas) === null || _a === void 0 ? void 0 : _a.clear();
    }
    _fillCells(x, y, width, height) {
        this._ctx.fillRect(x * this._scaledCellWidth, y * this._scaledCellHeight, width * this._scaledCellWidth, height * this._scaledCellHeight);
    }
    _fillMiddleLineAtCells(x, y, width = 1) {
        const cellOffset = Math.ceil(this._scaledCellHeight * 0.5);
        this._ctx.fillRect(x * this._scaledCellWidth, (y + 1) * this._scaledCellHeight - cellOffset - this._coreBrowserService.dpr, width * this._scaledCellWidth, this._coreBrowserService.dpr);
    }
    _fillBottomLineAtCells(x, y, width = 1, pixelOffset = 0) {
        this._ctx.fillRect(x * this._scaledCellWidth, (y + 1) * this._scaledCellHeight + pixelOffset - this._coreBrowserService.dpr - 1, width * this._scaledCellWidth, this._coreBrowserService.dpr);
    }
    _curlyUnderlineAtCell(x, y, width = 1) {
        this._ctx.save();
        this._ctx.beginPath();
        this._ctx.strokeStyle = this._ctx.fillStyle;
        const lineWidth = this._coreBrowserService.dpr;
        this._ctx.lineWidth = lineWidth;
        for (let xOffset = 0; xOffset < width; xOffset++) {
            const xLeft = (x + xOffset) * this._scaledCellWidth;
            const xMid = (x + xOffset + 0.5) * this._scaledCellWidth;
            const xRight = (x + xOffset + 1) * this._scaledCellWidth;
            const yMid = (y + 1) * this._scaledCellHeight - lineWidth - 1;
            const yMidBot = yMid - lineWidth;
            const yMidTop = yMid + lineWidth;
            this._ctx.moveTo(xLeft, yMid);
            this._ctx.bezierCurveTo(xLeft, yMidBot, xMid, yMidBot, xMid, yMid);
            this._ctx.bezierCurveTo(xMid, yMidTop, xRight, yMidTop, xRight, yMid);
        }
        this._ctx.stroke();
        this._ctx.restore();
    }
    _dottedUnderlineAtCell(x, y, width = 1) {
        this._ctx.save();
        this._ctx.beginPath();
        this._ctx.strokeStyle = this._ctx.fillStyle;
        const lineWidth = this._coreBrowserService.dpr;
        this._ctx.lineWidth = lineWidth;
        this._ctx.setLineDash([lineWidth * 2, lineWidth]);
        const xLeft = x * this._scaledCellWidth;
        const yMid = (y + 1) * this._scaledCellHeight - lineWidth - 1;
        this._ctx.moveTo(xLeft, yMid);
        for (let xOffset = 0; xOffset < width; xOffset++) {
            const xRight = (x + width + xOffset) * this._scaledCellWidth;
            this._ctx.lineTo(xRight, yMid);
        }
        this._ctx.stroke();
        this._ctx.closePath();
        this._ctx.restore();
    }
    _dashedUnderlineAtCell(x, y, width = 1) {
        this._ctx.save();
        this._ctx.beginPath();
        this._ctx.strokeStyle = this._ctx.fillStyle;
        const lineWidth = this._coreBrowserService.dpr;
        this._ctx.lineWidth = lineWidth;
        this._ctx.setLineDash([lineWidth * 4, lineWidth * 3]);
        const xLeft = x * this._scaledCellWidth;
        const xRight = (x + width) * this._scaledCellWidth;
        const yMid = (y + 1) * this._scaledCellHeight - lineWidth - 1;
        this._ctx.moveTo(xLeft, yMid);
        this._ctx.lineTo(xRight, yMid);
        this._ctx.stroke();
        this._ctx.closePath();
        this._ctx.restore();
    }
    _fillLeftLineAtCell(x, y, width) {
        this._ctx.fillRect(x * this._scaledCellWidth, y * this._scaledCellHeight, this._coreBrowserService.dpr * width, this._scaledCellHeight);
    }
    _strokeRectAtCell(x, y, width, height) {
        const lineWidth = this._coreBrowserService.dpr;
        this._ctx.lineWidth = lineWidth;
        this._ctx.strokeRect(x * this._scaledCellWidth + lineWidth / 2, y * this._scaledCellHeight + (lineWidth / 2), width * this._scaledCellWidth - lineWidth, (height * this._scaledCellHeight) - lineWidth);
    }
    _clearAll() {
        if (this._alpha) {
            this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        }
        else {
            this._ctx.fillStyle = this._colors.background.css;
            this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
        }
    }
    _clearCells(x, y, width, height) {
        if (this._alpha) {
            this._ctx.clearRect(x * this._scaledCellWidth, y * this._scaledCellHeight, width * this._scaledCellWidth, height * this._scaledCellHeight);
        }
        else {
            this._ctx.fillStyle = this._colors.background.css;
            this._ctx.fillRect(x * this._scaledCellWidth, y * this._scaledCellHeight, width * this._scaledCellWidth, height * this._scaledCellHeight);
        }
    }
    _fillCharTrueColor(cell, x, y) {
        this._ctx.font = this._getFont(false, false);
        this._ctx.textBaseline = Constants_2.TEXT_BASELINE;
        this._clipRow(y);
        let drawSuccess = false;
        if (this._optionsService.rawOptions.customGlyphs !== false) {
            drawSuccess = (0, CustomGlyphs_1.tryDrawCustomChar)(this._ctx, cell.getChars(), x * this._scaledCellWidth, y * this._scaledCellHeight, this._scaledCellWidth, this._scaledCellHeight, this._optionsService.rawOptions.fontSize, this._coreBrowserService.dpr);
        }
        if (!drawSuccess) {
            this._ctx.fillText(cell.getChars(), x * this._scaledCellWidth + this._scaledCharLeft, y * this._scaledCellHeight + this._scaledCharTop + this._scaledCharHeight);
        }
    }
    _drawChars(cell, x, y) {
        var _a;
        const contrastColor = this._getContrastColor(cell, x, y);
        if (contrastColor || cell.isFgRGB() || cell.isBgRGB()) {
            this._drawUncachedChars(cell, x, y, contrastColor);
            return;
        }
        let fg;
        let bg;
        if (cell.isInverse()) {
            fg = (cell.isBgDefault()) ? Constants_2.INVERTED_DEFAULT_COLOR : cell.getBgColor();
            bg = (cell.isFgDefault()) ? Constants_2.INVERTED_DEFAULT_COLOR : cell.getFgColor();
        }
        else {
            bg = (cell.isBgDefault()) ? Constants_1.DEFAULT_COLOR : cell.getBgColor();
            fg = (cell.isFgDefault()) ? Constants_1.DEFAULT_COLOR : cell.getFgColor();
        }
        const drawInBrightColor = this._optionsService.rawOptions.drawBoldTextInBrightColors && cell.isBold() && fg < 8;
        fg += drawInBrightColor ? 8 : 0;
        this._currentGlyphIdentifier.chars = cell.getChars() || Constants_1.WHITESPACE_CELL_CHAR;
        this._currentGlyphIdentifier.code = cell.getCode() || Constants_1.WHITESPACE_CELL_CODE;
        this._currentGlyphIdentifier.bg = bg;
        this._currentGlyphIdentifier.fg = fg;
        this._currentGlyphIdentifier.bold = !!cell.isBold();
        this._currentGlyphIdentifier.dim = !!cell.isDim();
        this._currentGlyphIdentifier.italic = !!cell.isItalic();
        let hasOverrides = false;
        this._decorationService.forEachDecorationAtCell(x, y, undefined, d => {
            if (d.backgroundColorRGB || d.foregroundColorRGB) {
                hasOverrides = true;
            }
        });
        const atlasDidDraw = hasOverrides ? false : (_a = this._charAtlas) === null || _a === void 0 ? void 0 : _a.draw(this._ctx, this._currentGlyphIdentifier, x * this._scaledCellWidth + this._scaledCharLeft, y * this._scaledCellHeight + this._scaledCharTop);
        if (!atlasDidDraw) {
            this._drawUncachedChars(cell, x, y);
        }
    }
    _drawUncachedChars(cell, x, y, fgOverride) {
        this._ctx.save();
        this._ctx.font = this._getFont(!!cell.isBold(), !!cell.isItalic());
        this._ctx.textBaseline = Constants_2.TEXT_BASELINE;
        if (cell.isInverse()) {
            if (fgOverride) {
                this._ctx.fillStyle = fgOverride.css;
            }
            else if (cell.isBgDefault()) {
                this._ctx.fillStyle = Color_1.color.opaque(this._colors.background).css;
            }
            else if (cell.isBgRGB()) {
                this._ctx.fillStyle = `rgb(${AttributeData_1.AttributeData.toColorRGB(cell.getBgColor()).join(',')})`;
            }
            else {
                let bg = cell.getBgColor();
                if (this._optionsService.rawOptions.drawBoldTextInBrightColors && cell.isBold() && bg < 8) {
                    bg += 8;
                }
                this._ctx.fillStyle = this._colors.ansi[bg].css;
            }
        }
        else {
            if (fgOverride) {
                this._ctx.fillStyle = fgOverride.css;
            }
            else if (cell.isFgDefault()) {
                this._ctx.fillStyle = this._colors.foreground.css;
            }
            else if (cell.isFgRGB()) {
                this._ctx.fillStyle = `rgb(${AttributeData_1.AttributeData.toColorRGB(cell.getFgColor()).join(',')})`;
            }
            else {
                let fg = cell.getFgColor();
                if (this._optionsService.rawOptions.drawBoldTextInBrightColors && cell.isBold() && fg < 8) {
                    fg += 8;
                }
                this._ctx.fillStyle = this._colors.ansi[fg].css;
            }
        }
        this._clipRow(y);
        if (cell.isDim()) {
            this._ctx.globalAlpha = Constants_2.DIM_OPACITY;
        }
        let drawSuccess = false;
        if (this._optionsService.rawOptions.customGlyphs !== false) {
            drawSuccess = (0, CustomGlyphs_1.tryDrawCustomChar)(this._ctx, cell.getChars(), x * this._scaledCellWidth, y * this._scaledCellHeight, this._scaledCellWidth, this._scaledCellHeight, this._optionsService.rawOptions.fontSize, this._coreBrowserService.dpr);
        }
        if (!drawSuccess) {
            this._ctx.fillText(cell.getChars(), x * this._scaledCellWidth + this._scaledCharLeft, y * this._scaledCellHeight + this._scaledCharTop + this._scaledCharHeight);
        }
        this._ctx.restore();
    }
    _clipRow(y) {
        this._ctx.beginPath();
        this._ctx.rect(0, y * this._scaledCellHeight, this._bufferService.cols * this._scaledCellWidth, this._scaledCellHeight);
        this._ctx.clip();
    }
    _getFont(isBold, isItalic) {
        const fontWeight = isBold ? this._optionsService.rawOptions.fontWeightBold : this._optionsService.rawOptions.fontWeight;
        const fontStyle = isItalic ? 'italic' : '';
        return `${fontStyle} ${fontWeight} ${this._optionsService.rawOptions.fontSize * this._coreBrowserService.dpr}px ${this._optionsService.rawOptions.fontFamily}`;
    }
    _getContrastColor(cell, x, y) {
        let bgOverride;
        let fgOverride;
        let isTop = false;
        this._decorationService.forEachDecorationAtCell(x, y, undefined, d => {
            if (d.options.layer !== 'top' && isTop) {
                return;
            }
            if (d.backgroundColorRGB) {
                bgOverride = d.backgroundColorRGB.rgba;
            }
            if (d.foregroundColorRGB) {
                fgOverride = d.foregroundColorRGB.rgba;
            }
            isTop = d.options.layer === 'top';
        });
        if (!isTop) {
            if (this._colors.selectionForeground && this._isCellInSelection(x, y)) {
                fgOverride = this._colors.selectionForeground.rgba;
            }
        }
        if (!bgOverride && !fgOverride && (this._optionsService.rawOptions.minimumContrastRatio === 1 || (0, RendererUtils_1.excludeFromContrastRatioDemands)(cell.getCode()))) {
            return undefined;
        }
        if (!bgOverride && !fgOverride) {
            const adjustedColor = this._colors.contrastCache.getColor(cell.bg, cell.fg);
            if (adjustedColor !== undefined) {
                return adjustedColor || undefined;
            }
        }
        let fgColor = cell.getFgColor();
        let fgColorMode = cell.getFgColorMode();
        let bgColor = cell.getBgColor();
        let bgColorMode = cell.getBgColorMode();
        const isInverse = !!cell.isInverse();
        const isBold = !!cell.isInverse();
        if (isInverse) {
            const temp = fgColor;
            fgColor = bgColor;
            bgColor = temp;
            const temp2 = fgColorMode;
            fgColorMode = bgColorMode;
            bgColorMode = temp2;
        }
        const bgRgba = this._resolveBackgroundRgba(bgOverride !== undefined ? 50331648 : bgColorMode, bgOverride !== null && bgOverride !== void 0 ? bgOverride : bgColor, isInverse);
        const fgRgba = this._resolveForegroundRgba(fgColorMode, fgColor, isInverse, isBold);
        let result = Color_1.rgba.ensureContrastRatio(bgOverride !== null && bgOverride !== void 0 ? bgOverride : bgRgba, fgOverride !== null && fgOverride !== void 0 ? fgOverride : fgRgba, this._optionsService.rawOptions.minimumContrastRatio);
        if (!result) {
            if (!fgOverride) {
                this._colors.contrastCache.setColor(cell.bg, cell.fg, null);
                return undefined;
            }
            result = fgOverride;
        }
        const color = {
            css: Color_1.channels.toCss((result >> 24) & 0xFF, (result >> 16) & 0xFF, (result >> 8) & 0xFF),
            rgba: result
        };
        if (!bgOverride && !fgOverride) {
            this._colors.contrastCache.setColor(cell.bg, cell.fg, color);
        }
        return color;
    }
    _resolveBackgroundRgba(bgColorMode, bgColor, inverse) {
        switch (bgColorMode) {
            case 16777216:
            case 33554432:
                return this._colors.ansi[bgColor].rgba;
            case 50331648:
                return bgColor << 8;
            case 0:
            default:
                if (inverse) {
                    return this._colors.foreground.rgba;
                }
                return this._colors.background.rgba;
        }
    }
    _resolveForegroundRgba(fgColorMode, fgColor, inverse, bold) {
        switch (fgColorMode) {
            case 16777216:
            case 33554432:
                if (this._optionsService.rawOptions.drawBoldTextInBrightColors && bold && fgColor < 8) {
                    fgColor += 8;
                }
                return this._colors.ansi[fgColor].rgba;
            case 50331648:
                return fgColor << 8;
            case 0:
            default:
                if (inverse) {
                    return this._colors.background.rgba;
                }
                return this._colors.foreground.rgba;
        }
    }
    _isCellInSelection(x, y) {
        const start = this._selectionStart;
        const end = this._selectionEnd;
        if (!start || !end) {
            return false;
        }
        if (this._columnSelectMode) {
            return x >= start[0] && y >= start[1] &&
                x < end[0] && y < end[1];
        }
        return (y > start[1] && y < end[1]) ||
            (start[1] === end[1] && y === start[1] && x >= start[0] && x < end[0]) ||
            (start[1] < end[1] && y === end[1] && x < end[0]) ||
            (start[1] < end[1] && y === start[1] && x >= start[0]);
    }
}
exports.BaseRenderLayer = BaseRenderLayer;
//# sourceMappingURL=BaseRenderLayer.js.map