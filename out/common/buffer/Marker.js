"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Marker = void 0;
const EventEmitter_1 = require("common/EventEmitter");
const Lifecycle_1 = require("common/Lifecycle");
class Marker extends Lifecycle_1.Disposable {
    constructor(line) {
        super();
        this.line = line;
        this._id = Marker._nextId++;
        this.isDisposed = false;
        this._onDispose = new EventEmitter_1.EventEmitter();
    }
    get id() { return this._id; }
    get onDispose() { return this._onDispose.event; }
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this.isDisposed = true;
        this.line = -1;
        this._onDispose.fire();
        super.dispose();
    }
}
exports.Marker = Marker;
Marker._nextId = 1;
//# sourceMappingURL=Marker.js.map