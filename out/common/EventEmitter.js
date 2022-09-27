"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forwardEvent = exports.EventEmitter = void 0;
class EventEmitter {
    constructor() {
        this._listeners = [];
        this._disposed = false;
    }
    get event() {
        if (!this._event) {
            this._event = (listener) => {
                this._listeners.push(listener);
                const disposable = {
                    dispose: () => {
                        if (!this._disposed) {
                            for (let i = 0; i < this._listeners.length; i++) {
                                if (this._listeners[i] === listener) {
                                    this._listeners.splice(i, 1);
                                    return;
                                }
                            }
                        }
                    }
                };
                return disposable;
            };
        }
        return this._event;
    }
    fire(arg1, arg2) {
        const queue = [];
        for (let i = 0; i < this._listeners.length; i++) {
            queue.push(this._listeners[i]);
        }
        for (let i = 0; i < queue.length; i++) {
            queue[i].call(undefined, arg1, arg2);
        }
    }
    dispose() {
        if (this._listeners) {
            this._listeners.length = 0;
        }
        this._disposed = true;
    }
}
exports.EventEmitter = EventEmitter;
function forwardEvent(from, to) {
    return from(e => to.fire(e));
}
exports.forwardEvent = forwardEvent;
//# sourceMappingURL=EventEmitter.js.map