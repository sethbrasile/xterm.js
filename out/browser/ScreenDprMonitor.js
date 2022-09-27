"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenDprMonitor = void 0;
const Lifecycle_1 = require("common/Lifecycle");
class ScreenDprMonitor extends Lifecycle_1.Disposable {
    constructor(_parentWindow) {
        super();
        this._parentWindow = _parentWindow;
        this._currentDevicePixelRatio = this._parentWindow.devicePixelRatio;
    }
    setListener(listener) {
        if (this._listener) {
            this.clearListener();
        }
        this._listener = listener;
        this._outerListener = () => {
            if (!this._listener) {
                return;
            }
            this._listener(this._parentWindow.devicePixelRatio, this._currentDevicePixelRatio);
            this._updateDpr();
        };
        this._updateDpr();
    }
    dispose() {
        super.dispose();
        this.clearListener();
    }
    _updateDpr() {
        var _a;
        if (!this._outerListener) {
            return;
        }
        (_a = this._resolutionMediaMatchList) === null || _a === void 0 ? void 0 : _a.removeListener(this._outerListener);
        this._currentDevicePixelRatio = this._parentWindow.devicePixelRatio;
        this._resolutionMediaMatchList = this._parentWindow.matchMedia(`screen and (resolution: ${this._parentWindow.devicePixelRatio}dppx)`);
        this._resolutionMediaMatchList.addListener(this._outerListener);
    }
    clearListener() {
        if (!this._resolutionMediaMatchList || !this._listener || !this._outerListener) {
            return;
        }
        this._resolutionMediaMatchList.removeListener(this._outerListener);
        this._resolutionMediaMatchList = undefined;
        this._listener = undefined;
        this._outerListener = undefined;
    }
}
exports.ScreenDprMonitor = ScreenDprMonitor;
//# sourceMappingURL=ScreenDprMonitor.js.map