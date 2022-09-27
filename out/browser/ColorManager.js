"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorManager = exports.DEFAULT_ANSI_COLORS = void 0;
const Color_1 = require("common/Color");
const ColorContrastCache_1 = require("browser/ColorContrastCache");
const DEFAULT_FOREGROUND = Color_1.css.toColor('#ffffff');
const DEFAULT_BACKGROUND = Color_1.css.toColor('#000000');
const DEFAULT_CURSOR = Color_1.css.toColor('#ffffff');
const DEFAULT_CURSOR_ACCENT = Color_1.css.toColor('#000000');
const DEFAULT_SELECTION = {
    css: 'rgba(255, 255, 255, 0.3)',
    rgba: 0xFFFFFF4D
};
exports.DEFAULT_ANSI_COLORS = Object.freeze((() => {
    const colors = [
        Color_1.css.toColor('#2e3436'),
        Color_1.css.toColor('#cc0000'),
        Color_1.css.toColor('#4e9a06'),
        Color_1.css.toColor('#c4a000'),
        Color_1.css.toColor('#3465a4'),
        Color_1.css.toColor('#75507b'),
        Color_1.css.toColor('#06989a'),
        Color_1.css.toColor('#d3d7cf'),
        Color_1.css.toColor('#555753'),
        Color_1.css.toColor('#ef2929'),
        Color_1.css.toColor('#8ae234'),
        Color_1.css.toColor('#fce94f'),
        Color_1.css.toColor('#729fcf'),
        Color_1.css.toColor('#ad7fa8'),
        Color_1.css.toColor('#34e2e2'),
        Color_1.css.toColor('#eeeeec')
    ];
    const v = [0x00, 0x5f, 0x87, 0xaf, 0xd7, 0xff];
    for (let i = 0; i < 216; i++) {
        const r = v[(i / 36) % 6 | 0];
        const g = v[(i / 6) % 6 | 0];
        const b = v[i % 6];
        colors.push({
            css: Color_1.channels.toCss(r, g, b),
            rgba: Color_1.channels.toRgba(r, g, b)
        });
    }
    for (let i = 0; i < 24; i++) {
        const c = 8 + i * 10;
        colors.push({
            css: Color_1.channels.toCss(c, c, c),
            rgba: Color_1.channels.toRgba(c, c, c)
        });
    }
    return colors;
})());
class ColorManager {
    constructor(document, allowTransparency) {
        this.allowTransparency = allowTransparency;
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get rendering context');
        }
        this._ctx = ctx;
        this._ctx.globalCompositeOperation = 'copy';
        this._litmusColor = this._ctx.createLinearGradient(0, 0, 1, 1);
        this._contrastCache = new ColorContrastCache_1.ColorContrastCache();
        this.colors = {
            foreground: DEFAULT_FOREGROUND,
            background: DEFAULT_BACKGROUND,
            cursor: DEFAULT_CURSOR,
            cursorAccent: DEFAULT_CURSOR_ACCENT,
            selectionForeground: undefined,
            selectionBackgroundTransparent: DEFAULT_SELECTION,
            selectionBackgroundOpaque: Color_1.color.blend(DEFAULT_BACKGROUND, DEFAULT_SELECTION),
            selectionInactiveBackgroundTransparent: DEFAULT_SELECTION,
            selectionInactiveBackgroundOpaque: Color_1.color.blend(DEFAULT_BACKGROUND, DEFAULT_SELECTION),
            ansi: exports.DEFAULT_ANSI_COLORS.slice(),
            contrastCache: this._contrastCache
        };
        this._updateRestoreColors();
    }
    onOptionsChange(key, value) {
        switch (key) {
            case 'minimumContrastRatio':
                this._contrastCache.clear();
                break;
            case 'allowTransparency':
                this.allowTransparency = value;
                break;
        }
    }
    setTheme(theme = {}) {
        this.colors.foreground = this._parseColor(theme.foreground, DEFAULT_FOREGROUND);
        this.colors.background = this._parseColor(theme.background, DEFAULT_BACKGROUND);
        this.colors.cursor = this._parseColor(theme.cursor, DEFAULT_CURSOR, true);
        this.colors.cursorAccent = this._parseColor(theme.cursorAccent, DEFAULT_CURSOR_ACCENT, true);
        this.colors.selectionBackgroundTransparent = this._parseColor(theme.selectionBackground, DEFAULT_SELECTION, true);
        this.colors.selectionBackgroundOpaque = Color_1.color.blend(this.colors.background, this.colors.selectionBackgroundTransparent);
        this.colors.selectionInactiveBackgroundTransparent = this._parseColor(theme.selectionInactiveBackground, this.colors.selectionBackgroundTransparent, true);
        this.colors.selectionInactiveBackgroundOpaque = Color_1.color.blend(this.colors.background, this.colors.selectionInactiveBackgroundTransparent);
        const nullColor = {
            css: '',
            rgba: 0
        };
        this.colors.selectionForeground = theme.selectionForeground ? this._parseColor(theme.selectionForeground, nullColor) : undefined;
        if (this.colors.selectionForeground === nullColor) {
            this.colors.selectionForeground = undefined;
        }
        if (Color_1.color.isOpaque(this.colors.selectionBackgroundTransparent)) {
            const opacity = 0.3;
            this.colors.selectionBackgroundTransparent = Color_1.color.opacity(this.colors.selectionBackgroundTransparent, opacity);
        }
        if (Color_1.color.isOpaque(this.colors.selectionInactiveBackgroundTransparent)) {
            const opacity = 0.3;
            this.colors.selectionInactiveBackgroundTransparent = Color_1.color.opacity(this.colors.selectionInactiveBackgroundTransparent, opacity);
        }
        this.colors.ansi = exports.DEFAULT_ANSI_COLORS.slice();
        this.colors.ansi[0] = this._parseColor(theme.black, exports.DEFAULT_ANSI_COLORS[0]);
        this.colors.ansi[1] = this._parseColor(theme.red, exports.DEFAULT_ANSI_COLORS[1]);
        this.colors.ansi[2] = this._parseColor(theme.green, exports.DEFAULT_ANSI_COLORS[2]);
        this.colors.ansi[3] = this._parseColor(theme.yellow, exports.DEFAULT_ANSI_COLORS[3]);
        this.colors.ansi[4] = this._parseColor(theme.blue, exports.DEFAULT_ANSI_COLORS[4]);
        this.colors.ansi[5] = this._parseColor(theme.magenta, exports.DEFAULT_ANSI_COLORS[5]);
        this.colors.ansi[6] = this._parseColor(theme.cyan, exports.DEFAULT_ANSI_COLORS[6]);
        this.colors.ansi[7] = this._parseColor(theme.white, exports.DEFAULT_ANSI_COLORS[7]);
        this.colors.ansi[8] = this._parseColor(theme.brightBlack, exports.DEFAULT_ANSI_COLORS[8]);
        this.colors.ansi[9] = this._parseColor(theme.brightRed, exports.DEFAULT_ANSI_COLORS[9]);
        this.colors.ansi[10] = this._parseColor(theme.brightGreen, exports.DEFAULT_ANSI_COLORS[10]);
        this.colors.ansi[11] = this._parseColor(theme.brightYellow, exports.DEFAULT_ANSI_COLORS[11]);
        this.colors.ansi[12] = this._parseColor(theme.brightBlue, exports.DEFAULT_ANSI_COLORS[12]);
        this.colors.ansi[13] = this._parseColor(theme.brightMagenta, exports.DEFAULT_ANSI_COLORS[13]);
        this.colors.ansi[14] = this._parseColor(theme.brightCyan, exports.DEFAULT_ANSI_COLORS[14]);
        this.colors.ansi[15] = this._parseColor(theme.brightWhite, exports.DEFAULT_ANSI_COLORS[15]);
        if (theme.extendedAnsi) {
            const colorCount = Math.min(this.colors.ansi.length - 16, theme.extendedAnsi.length);
            for (let i = 0; i < colorCount; i++) {
                this.colors.ansi[i + 16] = this._parseColor(theme.extendedAnsi[i], exports.DEFAULT_ANSI_COLORS[i + 16]);
            }
        }
        this._contrastCache.clear();
        this._updateRestoreColors();
    }
    restoreColor(slot) {
        if (slot === undefined) {
            for (let i = 0; i < this._restoreColors.ansi.length; ++i) {
                this.colors.ansi[i] = this._restoreColors.ansi[i];
            }
            return;
        }
        switch (slot) {
            case 256:
                this.colors.foreground = this._restoreColors.foreground;
                break;
            case 257:
                this.colors.background = this._restoreColors.background;
                break;
            case 258:
                this.colors.cursor = this._restoreColors.cursor;
                break;
            default:
                this.colors.ansi[slot] = this._restoreColors.ansi[slot];
        }
    }
    _updateRestoreColors() {
        this._restoreColors = {
            foreground: this.colors.foreground,
            background: this.colors.background,
            cursor: this.colors.cursor,
            ansi: this.colors.ansi.slice()
        };
    }
    _parseColor(css, fallback, allowTransparency = this.allowTransparency) {
        if (css === undefined) {
            return fallback;
        }
        this._ctx.fillStyle = this._litmusColor;
        this._ctx.fillStyle = css;
        if (typeof this._ctx.fillStyle !== 'string') {
            console.warn(`Color: ${css} is invalid using fallback ${fallback.css}`);
            return fallback;
        }
        this._ctx.fillRect(0, 0, 1, 1);
        const data = this._ctx.getImageData(0, 0, 1, 1).data;
        if (data[3] !== 0xFF) {
            if (!allowTransparency) {
                console.warn(`Color: ${css} is using transparency, but allowTransparency is false. ` +
                    `Using fallback ${fallback.css}.`);
                return fallback;
            }
            const [r, g, b, a] = this._ctx.fillStyle.substring(5, this._ctx.fillStyle.length - 1).split(',').map(component => Number(component));
            const alpha = Math.round(a * 255);
            const rgba = Color_1.channels.toRgba(r, g, b, alpha);
            return {
                rgba,
                css
            };
        }
        return {
            css: this._ctx.fillStyle,
            rgba: Color_1.channels.toRgba(data[0], data[1], data[2], data[3])
        };
    }
}
exports.ColorManager = ColorManager;
//# sourceMappingURL=ColorManager.js.map