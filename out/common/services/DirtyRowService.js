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
exports.DirtyRowService = void 0;
const Services_1 = require("common/services/Services");
let DirtyRowService = class DirtyRowService {
    constructor(_bufferService) {
        this._bufferService = _bufferService;
        this.clearRange();
    }
    get start() { return this._start; }
    get end() { return this._end; }
    clearRange() {
        this._start = this._bufferService.buffer.y;
        this._end = this._bufferService.buffer.y;
    }
    markDirty(y) {
        if (y < this._start) {
            this._start = y;
        }
        else if (y > this._end) {
            this._end = y;
        }
    }
    markRangeDirty(y1, y2) {
        if (y1 > y2) {
            const temp = y1;
            y1 = y2;
            y2 = temp;
        }
        if (y1 < this._start) {
            this._start = y1;
        }
        if (y2 > this._end) {
            this._end = y2;
        }
    }
    markAllDirty() {
        this.markRangeDirty(0, this._bufferService.rows - 1);
    }
};
DirtyRowService = __decorate([
    __param(0, Services_1.IBufferService)
], DirtyRowService);
exports.DirtyRowService = DirtyRowService;
//# sourceMappingURL=DirtyRowService.js.map