"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecorationService = void 0;
const Color_1 = require("common/Color");
const EventEmitter_1 = require("common/EventEmitter");
const Lifecycle_1 = require("common/Lifecycle");
const SortedList_1 = require("common/SortedList");
const w = {
    xmin: 0,
    xmax: 0
};
class DecorationService extends Lifecycle_1.Disposable {
    constructor() {
        super(...arguments);
        this._decorations = new SortedList_1.SortedList(e => e === null || e === void 0 ? void 0 : e.marker.line);
        this._onDecorationRegistered = this.register(new EventEmitter_1.EventEmitter());
        this._onDecorationRemoved = this.register(new EventEmitter_1.EventEmitter());
    }
    get onDecorationRegistered() { return this._onDecorationRegistered.event; }
    get onDecorationRemoved() { return this._onDecorationRemoved.event; }
    get decorations() { return this._decorations.values(); }
    registerDecoration(options) {
        if (options.marker.isDisposed) {
            return undefined;
        }
        const decoration = new Decoration(options);
        if (decoration) {
            const markerDispose = decoration.marker.onDispose(() => decoration.dispose());
            decoration.onDispose(() => {
                if (decoration) {
                    if (this._decorations.delete(decoration)) {
                        this._onDecorationRemoved.fire(decoration);
                    }
                    markerDispose.dispose();
                }
            });
            this._decorations.insert(decoration);
            this._onDecorationRegistered.fire(decoration);
        }
        return decoration;
    }
    reset() {
        for (const d of this._decorations.values()) {
            d.dispose();
        }
        this._decorations.clear();
    }
    *getDecorationsAtCell(x, line, layer) {
        var _a, _b, _c;
        let xmin = 0;
        let xmax = 0;
        for (const d of this._decorations.getKeyIterator(line)) {
            xmin = (_a = d.options.x) !== null && _a !== void 0 ? _a : 0;
            xmax = xmin + ((_b = d.options.width) !== null && _b !== void 0 ? _b : 1);
            if (x >= xmin && x < xmax && (!layer || ((_c = d.options.layer) !== null && _c !== void 0 ? _c : 'bottom') === layer)) {
                yield d;
            }
        }
    }
    forEachDecorationAtCell(x, line, layer, callback) {
        this._decorations.forEachByKey(line, d => {
            var _a, _b, _c;
            w.xmin = (_a = d.options.x) !== null && _a !== void 0 ? _a : 0;
            w.xmax = w.xmin + ((_b = d.options.width) !== null && _b !== void 0 ? _b : 1);
            if (x >= w.xmin && x < w.xmax && (!layer || ((_c = d.options.layer) !== null && _c !== void 0 ? _c : 'bottom') === layer)) {
                callback(d);
            }
        });
    }
    dispose() {
        for (const d of this._decorations.values()) {
            this._onDecorationRemoved.fire(d);
        }
        this.reset();
    }
}
exports.DecorationService = DecorationService;
class Decoration extends Lifecycle_1.Disposable {
    constructor(options) {
        super();
        this.options = options;
        this.isDisposed = false;
        this.onRenderEmitter = this.register(new EventEmitter_1.EventEmitter());
        this.onRender = this.onRenderEmitter.event;
        this._onDispose = this.register(new EventEmitter_1.EventEmitter());
        this.onDispose = this._onDispose.event;
        this._cachedBg = null;
        this._cachedFg = null;
        this.marker = options.marker;
        if (this.options.overviewRulerOptions && !this.options.overviewRulerOptions.position) {
            this.options.overviewRulerOptions.position = 'full';
        }
    }
    get backgroundColorRGB() {
        if (this._cachedBg === null) {
            if (this.options.backgroundColor) {
                this._cachedBg = Color_1.css.toColor(this.options.backgroundColor);
            }
            else {
                this._cachedBg = undefined;
            }
        }
        return this._cachedBg;
    }
    get foregroundColorRGB() {
        if (this._cachedFg === null) {
            if (this.options.foregroundColor) {
                this._cachedFg = Color_1.css.toColor(this.options.foregroundColor);
            }
            else {
                this._cachedFg = undefined;
            }
        }
        return this._cachedFg;
    }
    dispose() {
        if (this._isDisposed) {
            return;
        }
        this._isDisposed = true;
        this._onDispose.fire();
        super.dispose();
    }
}
//# sourceMappingURL=DecorationService.js.map