"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Terminal = void 0;
const BufferLine_1 = require("common/buffer/BufferLine");
const CoreTerminal_1 = require("common/CoreTerminal");
const EventEmitter_1 = require("common/EventEmitter");
class Terminal extends CoreTerminal_1.CoreTerminal {
    constructor(options = {}) {
        super(options);
        this._onBell = new EventEmitter_1.EventEmitter();
        this._onCursorMove = new EventEmitter_1.EventEmitter();
        this._onTitleChange = new EventEmitter_1.EventEmitter();
        this._onA11yCharEmitter = new EventEmitter_1.EventEmitter();
        this._onA11yTabEmitter = new EventEmitter_1.EventEmitter();
        this._setup();
        this.register(this._inputHandler.onRequestBell(() => this.bell()));
        this.register(this._inputHandler.onRequestReset(() => this.reset()));
        this.register((0, EventEmitter_1.forwardEvent)(this._inputHandler.onCursorMove, this._onCursorMove));
        this.register((0, EventEmitter_1.forwardEvent)(this._inputHandler.onTitleChange, this._onTitleChange));
        this.register((0, EventEmitter_1.forwardEvent)(this._inputHandler.onA11yChar, this._onA11yCharEmitter));
        this.register((0, EventEmitter_1.forwardEvent)(this._inputHandler.onA11yTab, this._onA11yTabEmitter));
    }
    get options() { return this.optionsService.options; }
    get onBell() { return this._onBell.event; }
    get onCursorMove() { return this._onCursorMove.event; }
    get onTitleChange() { return this._onTitleChange.event; }
    get onA11yChar() { return this._onA11yCharEmitter.event; }
    get onA11yTab() { return this._onA11yTabEmitter.event; }
    dispose() {
        if (this._isDisposed) {
            return;
        }
        super.dispose();
        this.write = () => { };
    }
    get buffer() {
        return this.buffers.active;
    }
    _updateOptions(key) {
        super._updateOptions(key);
        switch (key) {
            case 'tabStopWidth':
                this.buffers.setupTabStops();
                break;
        }
    }
    get markers() {
        return this.buffer.markers;
    }
    addMarker(cursorYOffset) {
        if (this.buffer !== this.buffers.normal) {
            return;
        }
        return this.buffer.addMarker(this.buffer.ybase + this.buffer.y + cursorYOffset);
    }
    bell() {
        this._onBell.fire();
    }
    resize(x, y) {
        if (x === this.cols && y === this.rows) {
            return;
        }
        super.resize(x, y);
    }
    clear() {
        if (this.buffer.ybase === 0 && this.buffer.y === 0) {
            return;
        }
        this.buffer.lines.set(0, this.buffer.lines.get(this.buffer.ybase + this.buffer.y));
        this.buffer.lines.length = 1;
        this.buffer.ydisp = 0;
        this.buffer.ybase = 0;
        this.buffer.y = 0;
        for (let i = 1; i < this.rows; i++) {
            this.buffer.lines.push(this.buffer.getBlankLine(BufferLine_1.DEFAULT_ATTR_DATA));
        }
        this._onScroll.fire({ position: this.buffer.ydisp, source: 0 });
    }
    reset() {
        this.options.rows = this.rows;
        this.options.cols = this.cols;
        this._setup();
        super.reset();
    }
}
exports.Terminal = Terminal;
//# sourceMappingURL=Terminal.js.map