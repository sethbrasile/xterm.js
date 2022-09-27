"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCharAtlas = void 0;
class BaseCharAtlas {
    constructor() {
        this._didWarmUp = false;
    }
    dispose() { }
    warmUp() {
        if (!this._didWarmUp) {
            this._doWarmUp();
            this._didWarmUp = true;
        }
    }
    _doWarmUp() { }
    clear() { }
    beginFrame() { }
}
exports.BaseCharAtlas = BaseCharAtlas;
//# sourceMappingURL=BaseCharAtlas.js.map