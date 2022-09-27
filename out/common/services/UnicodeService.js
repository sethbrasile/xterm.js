"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnicodeService = void 0;
const EventEmitter_1 = require("common/EventEmitter");
const UnicodeV6_1 = require("common/input/UnicodeV6");
class UnicodeService {
    constructor() {
        this._providers = Object.create(null);
        this._active = '';
        this._onChange = new EventEmitter_1.EventEmitter();
        const defaultProvider = new UnicodeV6_1.UnicodeV6();
        this.register(defaultProvider);
        this._active = defaultProvider.version;
        this._activeProvider = defaultProvider;
    }
    get onChange() { return this._onChange.event; }
    get versions() {
        return Object.keys(this._providers);
    }
    get activeVersion() {
        return this._active;
    }
    set activeVersion(version) {
        if (!this._providers[version]) {
            throw new Error(`unknown Unicode version "${version}"`);
        }
        this._active = version;
        this._activeProvider = this._providers[version];
        this._onChange.fire(version);
    }
    register(provider) {
        this._providers[provider.version] = provider;
    }
    wcwidth(num) {
        return this._activeProvider.wcwidth(num);
    }
    getStringCellWidth(s) {
        let result = 0;
        const length = s.length;
        for (let i = 0; i < length; ++i) {
            let code = s.charCodeAt(i);
            if (0xD800 <= code && code <= 0xDBFF) {
                if (++i >= length) {
                    return result + this.wcwidth(code);
                }
                const second = s.charCodeAt(i);
                if (0xDC00 <= second && second <= 0xDFFF) {
                    code = (code - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
                }
                else {
                    result += this.wcwidth(second);
                }
            }
            result += this.wcwidth(code);
        }
        return result;
    }
}
exports.UnicodeService = UnicodeService;
//# sourceMappingURL=UnicodeService.js.map