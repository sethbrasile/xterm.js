"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferService = exports.MINIMUM_ROWS = exports.MINIMUM_COLS = void 0;
const Services_1 = require("common/services/Services");
const BufferSet_1 = require("common/buffer/BufferSet");
const EventEmitter_1 = require("common/EventEmitter");
const Lifecycle_1 = require("common/Lifecycle");
exports.MINIMUM_COLS = 2;
exports.MINIMUM_ROWS = 1;
let BufferService = class BufferService extends Lifecycle_1.Disposable {
    constructor(optionsService) {
        super();
        this.isUserScrolling = false;
        this._onResize = new EventEmitter_1.EventEmitter();
        this._onScroll = new EventEmitter_1.EventEmitter();
        this.cols = Math.max(optionsService.rawOptions.cols || 0, exports.MINIMUM_COLS);
        this.rows = Math.max(optionsService.rawOptions.rows || 0, exports.MINIMUM_ROWS);
        this.buffers = new BufferSet_1.BufferSet(optionsService, this);
    }
    get onResize() { return this._onResize.event; }
    get onScroll() { return this._onScroll.event; }
    get buffer() { return this.buffers.active; }
    dispose() {
        super.dispose();
        this.buffers.dispose();
    }
    resize(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.buffers.resize(cols, rows);
        this.buffers.setupTabStops(this.cols);
        this._onResize.fire({ cols, rows });
    }
    reset() {
        this.buffers.reset();
        this.isUserScrolling = false;
    }
    scroll(eraseAttr, isWrapped = false) {
        const buffer = this.buffer;
        let newLine;
        newLine = this._cachedBlankLine;
        if (!newLine || newLine.length !== this.cols || newLine.getFg(0) !== eraseAttr.fg || newLine.getBg(0) !== eraseAttr.bg) {
            newLine = buffer.getBlankLine(eraseAttr, isWrapped);
            this._cachedBlankLine = newLine;
        }
        newLine.isWrapped = isWrapped;
        const topRow = buffer.ybase + buffer.scrollTop;
        const bottomRow = buffer.ybase + buffer.scrollBottom;
        if (buffer.scrollTop === 0) {
            const willBufferBeTrimmed = buffer.lines.isFull;
            if (bottomRow === buffer.lines.length - 1) {
                if (willBufferBeTrimmed) {
                    buffer.lines.recycle().copyFrom(newLine);
                }
                else {
                    buffer.lines.push(newLine.clone());
                }
            }
            else {
                buffer.lines.splice(bottomRow + 1, 0, newLine.clone());
            }
            if (!willBufferBeTrimmed) {
                buffer.ybase++;
                if (!this.isUserScrolling) {
                    buffer.ydisp++;
                }
            }
            else {
                if (this.isUserScrolling) {
                    buffer.ydisp = Math.max(buffer.ydisp - 1, 0);
                }
            }
        }
        else {
            const scrollRegionHeight = bottomRow - topRow + 1;
            buffer.lines.shiftElements(topRow + 1, scrollRegionHeight - 1, -1);
            buffer.lines.set(bottomRow, newLine.clone());
        }
        if (!this.isUserScrolling) {
            buffer.ydisp = buffer.ybase;
        }
        this._onScroll.fire(buffer.ydisp);
    }
    scrollLines(disp, suppressScrollEvent, source) {
        const buffer = this.buffer;
        if (disp < 0) {
            if (buffer.ydisp === 0) {
                return;
            }
            this.isUserScrolling = true;
        }
        else if (disp + buffer.ydisp >= buffer.ybase) {
            this.isUserScrolling = false;
        }
        const oldYdisp = buffer.ydisp;
        buffer.ydisp = Math.max(Math.min(buffer.ydisp + disp, buffer.ybase), 0);
        if (oldYdisp === buffer.ydisp) {
            return;
        }
        if (!suppressScrollEvent) {
            this._onScroll.fire(buffer.ydisp);
        }
    }
    scrollPages(pageCount) {
        this.scrollLines(pageCount * (this.rows - 1));
    }
    scrollToTop() {
        this.scrollLines(-this.buffer.ydisp);
    }
    scrollToBottom() {
        this.scrollLines(this.buffer.ybase - this.buffer.ydisp);
    }
    scrollToLine(line) {
        const scrollAmount = line - this.buffer.ydisp;
        if (scrollAmount !== 0) {
            this.scrollLines(scrollAmount);
        }
    }
};
BufferService = __decorate([
    __param(0, Services_1.IOptionsService)
], BufferService);
exports.BufferService = BufferService;
//# sourceMappingURL=BufferService.js.map