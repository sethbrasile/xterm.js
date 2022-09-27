"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionsService = exports.DEFAULT_OPTIONS = void 0;
const EventEmitter_1 = require("common/EventEmitter");
const Platform_1 = require("common/Platform");
exports.DEFAULT_OPTIONS = {
    cols: 80,
    rows: 24,
    cursorBlink: false,
    cursorStyle: 'block',
    cursorWidth: 1,
    customGlyphs: true,
    drawBoldTextInBrightColors: true,
    fastScrollModifier: 'alt',
    fastScrollSensitivity: 5,
    fontFamily: 'courier-new, courier, monospace',
    fontSize: 15,
    fontWeight: 'normal',
    fontWeightBold: 'bold',
    lineHeight: 1.0,
    letterSpacing: 0,
    linkHandler: null,
    logLevel: 'info',
    scrollback: 1000,
    scrollSensitivity: 1,
    screenReaderMode: false,
    smoothScrollDuration: 0,
    macOptionIsMeta: false,
    macOptionClickForcesSelection: false,
    minimumContrastRatio: 1,
    disableStdin: false,
    allowProposedApi: false,
    allowTransparency: false,
    tabStopWidth: 8,
    theme: {},
    rightClickSelectsWord: Platform_1.isMac,
    windowOptions: {},
    windowsMode: false,
    wordSeparator: ' ()[]{}\',"`',
    altClickMovesCursor: true,
    convertEol: false,
    termName: 'xterm',
    cancelEvents: false,
    overviewRulerWidth: 0
};
const FONT_WEIGHT_OPTIONS = ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
class OptionsService {
    constructor(options) {
        this._onOptionChange = new EventEmitter_1.EventEmitter();
        const defaultOptions = Object.assign({}, exports.DEFAULT_OPTIONS);
        for (const key in options) {
            if (key in defaultOptions) {
                try {
                    const newValue = options[key];
                    defaultOptions[key] = this._sanitizeAndValidateOption(key, newValue);
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
        this.rawOptions = defaultOptions;
        this.options = Object.assign({}, defaultOptions);
        this._setupOptions();
    }
    get onOptionChange() { return this._onOptionChange.event; }
    _setupOptions() {
        const getter = (propName) => {
            if (!(propName in exports.DEFAULT_OPTIONS)) {
                throw new Error(`No option with key "${propName}"`);
            }
            return this.rawOptions[propName];
        };
        const setter = (propName, value) => {
            if (!(propName in exports.DEFAULT_OPTIONS)) {
                throw new Error(`No option with key "${propName}"`);
            }
            value = this._sanitizeAndValidateOption(propName, value);
            if (this.rawOptions[propName] !== value) {
                this.rawOptions[propName] = value;
                this._onOptionChange.fire(propName);
            }
        };
        for (const propName in this.rawOptions) {
            const desc = {
                get: getter.bind(this, propName),
                set: setter.bind(this, propName)
            };
            Object.defineProperty(this.options, propName, desc);
        }
    }
    _sanitizeAndValidateOption(key, value) {
        switch (key) {
            case 'cursorStyle':
                if (!value) {
                    value = exports.DEFAULT_OPTIONS[key];
                }
                if (!isCursorStyle(value)) {
                    throw new Error(`"${value}" is not a valid value for ${key}`);
                }
                break;
            case 'wordSeparator':
                if (!value) {
                    value = exports.DEFAULT_OPTIONS[key];
                }
                break;
            case 'fontWeight':
            case 'fontWeightBold':
                if (typeof value === 'number' && 1 <= value && value <= 1000) {
                    break;
                }
                value = FONT_WEIGHT_OPTIONS.includes(value) ? value : exports.DEFAULT_OPTIONS[key];
                break;
            case 'cursorWidth':
                value = Math.floor(value);
            case 'lineHeight':
            case 'tabStopWidth':
                if (value < 1) {
                    throw new Error(`${key} cannot be less than 1, value: ${value}`);
                }
                break;
            case 'minimumContrastRatio':
                value = Math.max(1, Math.min(21, Math.round(value * 10) / 10));
                break;
            case 'scrollback':
                value = Math.min(value, 4294967295);
                if (value < 0) {
                    throw new Error(`${key} cannot be less than 0, value: ${value}`);
                }
                break;
            case 'fastScrollSensitivity':
            case 'scrollSensitivity':
                if (value <= 0) {
                    throw new Error(`${key} cannot be less than or equal to 0, value: ${value}`);
                }
            case 'rows':
            case 'cols':
                if (!value && value !== 0) {
                    throw new Error(`${key} must be numeric, value: ${value}`);
                }
                break;
        }
        return value;
    }
}
exports.OptionsService = OptionsService;
function isCursorStyle(value) {
    return value === 'block' || value === 'underline' || value === 'bar';
}
//# sourceMappingURL=OptionsService.js.map