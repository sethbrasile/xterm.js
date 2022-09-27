"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoneCharAtlas = exports.DynamicCharAtlas = exports.getGlyphCacheKey = void 0;
const Constants_1 = require("browser/renderer/Constants");
const BaseCharAtlas_1 = require("./BaseCharAtlas");
const ColorManager_1 = require("browser/ColorManager");
const LRUMap_1 = require("./LRUMap");
const Platform_1 = require("common/Platform");
const RendererUtils_1 = require("browser/renderer/RendererUtils");
const Color_1 = require("common/Color");
const TEXTURE_WIDTH = 1024;
const TEXTURE_HEIGHT = 1024;
const TRANSPARENT_COLOR = {
    css: 'rgba(0, 0, 0, 0)',
    rgba: 0
};
const FRAME_CACHE_DRAW_LIMIT = 100;
const GLYPH_BITMAP_COMMIT_DELAY = 100;
function getGlyphCacheKey(glyph) {
    return glyph.code << 21 | glyph.bg << 12 | glyph.fg << 3 | (glyph.bold ? 0 : 4) + (glyph.dim ? 0 : 2) + (glyph.italic ? 0 : 1);
}
exports.getGlyphCacheKey = getGlyphCacheKey;
class DynamicCharAtlas extends BaseCharAtlas_1.BaseCharAtlas {
    constructor(document, _config) {
        super();
        this._config = _config;
        this._drawToCacheCount = 0;
        this._glyphsWaitingOnBitmap = [];
        this._bitmapCommitTimeout = null;
        this._bitmap = null;
        this._cacheCanvas = document.createElement('canvas');
        this._cacheCanvas.width = TEXTURE_WIDTH;
        this._cacheCanvas.height = TEXTURE_HEIGHT;
        this._cacheCtx = (0, RendererUtils_1.throwIfFalsy)(this._cacheCanvas.getContext('2d', { alpha: true }));
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = this._config.scaledCharWidth;
        tmpCanvas.height = this._config.scaledCharHeight;
        this._tmpCtx = (0, RendererUtils_1.throwIfFalsy)(tmpCanvas.getContext('2d', { alpha: this._config.allowTransparency }));
        this._width = Math.floor(TEXTURE_WIDTH / this._config.scaledCharWidth);
        this._height = Math.floor(TEXTURE_HEIGHT / this._config.scaledCharHeight);
        const capacity = this._width * this._height;
        this._cacheMap = new LRUMap_1.LRUMap(capacity);
        this._cacheMap.prealloc(capacity);
    }
    dispose() {
        if (this._bitmapCommitTimeout !== null) {
            window.clearTimeout(this._bitmapCommitTimeout);
            this._bitmapCommitTimeout = null;
        }
    }
    beginFrame() {
        this._drawToCacheCount = 0;
    }
    clear() {
        if (this._cacheMap.size > 0) {
            const capacity = this._width * this._height;
            this._cacheMap = new LRUMap_1.LRUMap(capacity);
            this._cacheMap.prealloc(capacity);
        }
        this._cacheCtx.clearRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
        this._tmpCtx.clearRect(0, 0, this._config.scaledCharWidth, this._config.scaledCharHeight);
    }
    draw(ctx, glyph, x, y) {
        if (glyph.code === 32) {
            return true;
        }
        if (!this._canCache(glyph)) {
            return false;
        }
        const glyphKey = getGlyphCacheKey(glyph);
        const cacheValue = this._cacheMap.get(glyphKey);
        if (cacheValue !== null && cacheValue !== undefined) {
            this._drawFromCache(ctx, cacheValue, x, y);
            return true;
        }
        if (this._drawToCacheCount < FRAME_CACHE_DRAW_LIMIT) {
            let index;
            if (this._cacheMap.size < this._cacheMap.capacity) {
                index = this._cacheMap.size;
            }
            else {
                index = this._cacheMap.peek().index;
            }
            const cacheValue = this._drawToCache(glyph, index);
            this._cacheMap.set(glyphKey, cacheValue);
            this._drawFromCache(ctx, cacheValue, x, y);
            return true;
        }
        return false;
    }
    _canCache(glyph) {
        return glyph.code < 256;
    }
    _toCoordinateX(index) {
        return (index % this._width) * this._config.scaledCharWidth;
    }
    _toCoordinateY(index) {
        return Math.floor(index / this._width) * this._config.scaledCharHeight;
    }
    _drawFromCache(ctx, cacheValue, x, y) {
        if (cacheValue.isEmpty) {
            return;
        }
        const cacheX = this._toCoordinateX(cacheValue.index);
        const cacheY = this._toCoordinateY(cacheValue.index);
        ctx.drawImage(cacheValue.inBitmap ? this._bitmap : this._cacheCanvas, cacheX, cacheY, this._config.scaledCharWidth, this._config.scaledCharHeight, x, y, this._config.scaledCharWidth, this._config.scaledCharHeight);
    }
    _getColorFromAnsiIndex(idx) {
        if (idx < this._config.colors.ansi.length) {
            return this._config.colors.ansi[idx];
        }
        return ColorManager_1.DEFAULT_ANSI_COLORS[idx];
    }
    _getBackgroundColor(glyph) {
        if (this._config.allowTransparency) {
            return TRANSPARENT_COLOR;
        }
        let result;
        if (glyph.bg === Constants_1.INVERTED_DEFAULT_COLOR) {
            result = this._config.colors.foreground;
        }
        else if (glyph.bg < 256) {
            result = this._getColorFromAnsiIndex(glyph.bg);
        }
        else {
            result = this._config.colors.background;
        }
        if (glyph.dim) {
            result = Color_1.color.blend(this._config.colors.background, Color_1.color.multiplyOpacity(result, 0.5));
        }
        return result;
    }
    _getForegroundColor(glyph) {
        if (glyph.fg === Constants_1.INVERTED_DEFAULT_COLOR) {
            return Color_1.color.opaque(this._config.colors.background);
        }
        if (glyph.fg < 256) {
            return this._getColorFromAnsiIndex(glyph.fg);
        }
        return this._config.colors.foreground;
    }
    _drawToCache(glyph, index) {
        this._drawToCacheCount++;
        this._tmpCtx.save();
        const backgroundColor = this._getBackgroundColor(glyph);
        this._tmpCtx.globalCompositeOperation = 'copy';
        this._tmpCtx.fillStyle = backgroundColor.css;
        this._tmpCtx.fillRect(0, 0, this._config.scaledCharWidth, this._config.scaledCharHeight);
        this._tmpCtx.globalCompositeOperation = 'source-over';
        const fontWeight = glyph.bold ? this._config.fontWeightBold : this._config.fontWeight;
        const fontStyle = glyph.italic ? 'italic' : '';
        this._tmpCtx.font =
            `${fontStyle} ${fontWeight} ${this._config.fontSize * this._config.devicePixelRatio}px ${this._config.fontFamily}`;
        this._tmpCtx.textBaseline = Constants_1.TEXT_BASELINE;
        this._tmpCtx.fillStyle = this._getForegroundColor(glyph).css;
        if (glyph.dim) {
            this._tmpCtx.globalAlpha = Constants_1.DIM_OPACITY;
        }
        this._tmpCtx.fillText(glyph.chars, 0, this._config.scaledCharHeight);
        let imageData = this._tmpCtx.getImageData(0, 0, this._config.scaledCharWidth, this._config.scaledCharHeight);
        let isEmpty = false;
        if (!this._config.allowTransparency) {
            isEmpty = clearColor(imageData, backgroundColor);
        }
        if (isEmpty && glyph.chars === '_' && !this._config.allowTransparency) {
            for (let offset = 1; offset <= 5; offset++) {
                this._tmpCtx.fillText(glyph.chars, 0, this._config.scaledCharHeight - offset);
                imageData = this._tmpCtx.getImageData(0, 0, this._config.scaledCharWidth, this._config.scaledCharHeight);
                isEmpty = clearColor(imageData, backgroundColor);
                if (!isEmpty) {
                    break;
                }
            }
        }
        this._tmpCtx.restore();
        const x = this._toCoordinateX(index);
        const y = this._toCoordinateY(index);
        this._cacheCtx.putImageData(imageData, x, y);
        const cacheValue = {
            index,
            isEmpty,
            inBitmap: false
        };
        this._addGlyphToBitmap(cacheValue);
        return cacheValue;
    }
    _addGlyphToBitmap(cacheValue) {
        if (!('createImageBitmap' in window) || Platform_1.isFirefox || Platform_1.isSafari) {
            return;
        }
        this._glyphsWaitingOnBitmap.push(cacheValue);
        if (this._bitmapCommitTimeout !== null) {
            return;
        }
        this._bitmapCommitTimeout = window.setTimeout(() => this._generateBitmap(), GLYPH_BITMAP_COMMIT_DELAY);
    }
    _generateBitmap() {
        const glyphsMovingToBitmap = this._glyphsWaitingOnBitmap;
        this._glyphsWaitingOnBitmap = [];
        window.createImageBitmap(this._cacheCanvas).then(bitmap => {
            this._bitmap = bitmap;
            for (let i = 0; i < glyphsMovingToBitmap.length; i++) {
                const value = glyphsMovingToBitmap[i];
                value.inBitmap = true;
            }
        });
        this._bitmapCommitTimeout = null;
    }
}
exports.DynamicCharAtlas = DynamicCharAtlas;
class NoneCharAtlas extends BaseCharAtlas_1.BaseCharAtlas {
    constructor(document, config) {
        super();
    }
    draw(ctx, glyph, x, y) {
        return false;
    }
}
exports.NoneCharAtlas = NoneCharAtlas;
function clearColor(imageData, color) {
    let isEmpty = true;
    const r = color.rgba >>> 24;
    const g = color.rgba >>> 16 & 0xFF;
    const b = color.rgba >>> 8 & 0xFF;
    for (let offset = 0; offset < imageData.data.length; offset += 4) {
        if (Math.abs(imageData.data[offset] - r) +
            Math.abs(imageData.data[offset + 1] - g) +
            Math.abs(imageData.data[offset + 2] - b) < 35) {
            imageData.data[offset + 3] = 0;
        }
        else {
            isEmpty = false;
        }
    }
    return isEmpty;
}
//# sourceMappingURL=DynamicCharAtlas.js.map