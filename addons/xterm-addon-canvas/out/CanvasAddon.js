"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasAddon = void 0;
const CanvasRenderer_1 = require("./CanvasRenderer");
class CanvasAddon {
    activate(terminal) {
        if (!terminal.element) {
            throw new Error('Cannot activate CanvasAddon before Terminal.open');
        }
        this._terminal = terminal;
        const bufferService = terminal._core._bufferService;
        const renderService = terminal._core._renderService;
        const characterJoinerService = terminal._core._characterJoinerService;
        const charSizeService = terminal._core._charSizeService;
        const coreService = terminal._core.coreService;
        const coreBrowserService = terminal._core._coreBrowserService;
        const decorationService = terminal._core._decorationService;
        const optionsService = terminal._core.optionsService;
        const colors = terminal._core._colorManager.colors;
        const screenElement = terminal._core.screenElement;
        const linkifier = terminal._core.linkifier2;
        this._renderer = new CanvasRenderer_1.CanvasRenderer(colors, screenElement, linkifier, bufferService, charSizeService, optionsService, characterJoinerService, coreService, coreBrowserService, decorationService);
        renderService.setRenderer(this._renderer);
        renderService.onResize(bufferService.cols, bufferService.rows);
    }
    dispose() {
        var _a;
        if (!this._terminal) {
            throw new Error('Cannot dispose CanvasAddon because it is activated');
        }
        const renderService = this._terminal._core._renderService;
        renderService.setRenderer(this._terminal._core._createRenderer());
        renderService.onResize(this._terminal.cols, this._terminal.rows);
        (_a = this._renderer) === null || _a === void 0 ? void 0 : _a.dispose();
        this._renderer = undefined;
    }
}
exports.CanvasAddon = CanvasAddon;
//# sourceMappingURL=CanvasAddon.js.map