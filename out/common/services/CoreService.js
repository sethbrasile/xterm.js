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
exports.CoreService = void 0;
const Services_1 = require("common/services/Services");
const EventEmitter_1 = require("common/EventEmitter");
const Clone_1 = require("common/Clone");
const Lifecycle_1 = require("common/Lifecycle");
const DEFAULT_MODES = Object.freeze({
    insertMode: false
});
const DEFAULT_DEC_PRIVATE_MODES = Object.freeze({
    applicationCursorKeys: false,
    applicationKeypad: false,
    bracketedPasteMode: false,
    origin: false,
    reverseWraparound: false,
    sendFocus: false,
    wraparound: true
});
let CoreService = class CoreService extends Lifecycle_1.Disposable {
    constructor(scrollToBottom, _bufferService, _logService, _optionsService) {
        super();
        this._bufferService = _bufferService;
        this._logService = _logService;
        this._optionsService = _optionsService;
        this.isCursorInitialized = false;
        this.isCursorHidden = false;
        this._onData = this.register(new EventEmitter_1.EventEmitter());
        this._onUserInput = this.register(new EventEmitter_1.EventEmitter());
        this._onBinary = this.register(new EventEmitter_1.EventEmitter());
        this._scrollToBottom = scrollToBottom;
        this.register({ dispose: () => this._scrollToBottom = undefined });
        this.modes = (0, Clone_1.clone)(DEFAULT_MODES);
        this.decPrivateModes = (0, Clone_1.clone)(DEFAULT_DEC_PRIVATE_MODES);
    }
    get onData() { return this._onData.event; }
    get onUserInput() { return this._onUserInput.event; }
    get onBinary() { return this._onBinary.event; }
    reset() {
        this.modes = (0, Clone_1.clone)(DEFAULT_MODES);
        this.decPrivateModes = (0, Clone_1.clone)(DEFAULT_DEC_PRIVATE_MODES);
    }
    triggerDataEvent(data, wasUserInput = false) {
        if (this._optionsService.rawOptions.disableStdin) {
            return;
        }
        const buffer = this._bufferService.buffer;
        if (buffer.ybase !== buffer.ydisp) {
            this._scrollToBottom();
        }
        if (wasUserInput) {
            this._onUserInput.fire();
        }
        this._logService.debug(`sending data "${data}"`, () => data.split('').map(e => e.charCodeAt(0)));
        this._onData.fire(data);
    }
    triggerBinaryEvent(data) {
        if (this._optionsService.rawOptions.disableStdin) {
            return;
        }
        this._logService.debug(`sending binary "${data}"`, () => data.split('').map(e => e.charCodeAt(0)));
        this._onBinary.fire(data);
    }
};
CoreService = __decorate([
    __param(1, Services_1.IBufferService),
    __param(2, Services_1.ILogService),
    __param(3, Services_1.IOptionsService)
], CoreService);
exports.CoreService = CoreService;
//# sourceMappingURL=CoreService.js.map