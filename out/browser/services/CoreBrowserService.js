"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreBrowserService = void 0;
class CoreBrowserService {
    constructor(_textarea, window) {
        this._textarea = _textarea;
        this.window = window;
    }
    get dpr() {
        return this.window.devicePixelRatio;
    }
    get isFocused() {
        const docOrShadowRoot = this._textarea.getRootNode ? this._textarea.getRootNode() : this._textarea.ownerDocument;
        return docOrShadowRoot.activeElement === this._textarea && this._textarea.ownerDocument.hasFocus();
    }
}
exports.CoreBrowserService = CoreBrowserService;
//# sourceMappingURL=CoreBrowserService.js.map