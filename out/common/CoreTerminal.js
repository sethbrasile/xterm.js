"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreTerminal = void 0;
const Lifecycle_1 = require("common/Lifecycle");
const Services_1 = require("common/services/Services");
const InstantiationService_1 = require("common/services/InstantiationService");
const LogService_1 = require("common/services/LogService");
const BufferService_1 = require("common/services/BufferService");
const OptionsService_1 = require("common/services/OptionsService");
const CoreService_1 = require("common/services/CoreService");
const EventEmitter_1 = require("common/EventEmitter");
const CoreMouseService_1 = require("common/services/CoreMouseService");
const DirtyRowService_1 = require("common/services/DirtyRowService");
const UnicodeService_1 = require("common/services/UnicodeService");
const CharsetService_1 = require("common/services/CharsetService");
const WindowsMode_1 = require("common/WindowsMode");
const InputHandler_1 = require("common/InputHandler");
const WriteBuffer_1 = require("common/input/WriteBuffer");
const OscLinkService_1 = require("common/services/OscLinkService");
let hasWriteSyncWarnHappened = false;
class CoreTerminal extends Lifecycle_1.Disposable {
    constructor(options) {
        super();
        this._onBinary = new EventEmitter_1.EventEmitter();
        this._onData = new EventEmitter_1.EventEmitter();
        this._onLineFeed = new EventEmitter_1.EventEmitter();
        this._onResize = new EventEmitter_1.EventEmitter();
        this._onScroll = new EventEmitter_1.EventEmitter();
        this._onWriteParsed = new EventEmitter_1.EventEmitter();
        this._instantiationService = new InstantiationService_1.InstantiationService();
        this.optionsService = new OptionsService_1.OptionsService(options);
        this._instantiationService.setService(Services_1.IOptionsService, this.optionsService);
        this._bufferService = this.register(this._instantiationService.createInstance(BufferService_1.BufferService));
        this._instantiationService.setService(Services_1.IBufferService, this._bufferService);
        this._logService = this._instantiationService.createInstance(LogService_1.LogService);
        this._instantiationService.setService(Services_1.ILogService, this._logService);
        this.coreService = this.register(this._instantiationService.createInstance(CoreService_1.CoreService, () => this.scrollToBottom()));
        this._instantiationService.setService(Services_1.ICoreService, this.coreService);
        this.coreMouseService = this._instantiationService.createInstance(CoreMouseService_1.CoreMouseService);
        this._instantiationService.setService(Services_1.ICoreMouseService, this.coreMouseService);
        this._dirtyRowService = this._instantiationService.createInstance(DirtyRowService_1.DirtyRowService);
        this._instantiationService.setService(Services_1.IDirtyRowService, this._dirtyRowService);
        this.unicodeService = this._instantiationService.createInstance(UnicodeService_1.UnicodeService);
        this._instantiationService.setService(Services_1.IUnicodeService, this.unicodeService);
        this._charsetService = this._instantiationService.createInstance(CharsetService_1.CharsetService);
        this._instantiationService.setService(Services_1.ICharsetService, this._charsetService);
        this._oscLinkService = this._instantiationService.createInstance(OscLinkService_1.OscLinkService);
        this._instantiationService.setService(Services_1.IOscLinkService, this._oscLinkService);
        this._inputHandler = new InputHandler_1.InputHandler(this._bufferService, this._charsetService, this.coreService, this._dirtyRowService, this._logService, this.optionsService, this._oscLinkService, this.coreMouseService, this.unicodeService);
        this.register((0, EventEmitter_1.forwardEvent)(this._inputHandler.onLineFeed, this._onLineFeed));
        this.register(this._inputHandler);
        this.register((0, EventEmitter_1.forwardEvent)(this._bufferService.onResize, this._onResize));
        this.register((0, EventEmitter_1.forwardEvent)(this.coreService.onData, this._onData));
        this.register((0, EventEmitter_1.forwardEvent)(this.coreService.onBinary, this._onBinary));
        this.register(this.optionsService.onOptionChange(key => this._updateOptions(key)));
        this.register(this._bufferService.onScroll(event => {
            this._onScroll.fire({ position: this._bufferService.buffer.ydisp, source: 0 });
            this._dirtyRowService.markRangeDirty(this._bufferService.buffer.scrollTop, this._bufferService.buffer.scrollBottom);
        }));
        this.register(this._inputHandler.onScroll(event => {
            this._onScroll.fire({ position: this._bufferService.buffer.ydisp, source: 0 });
            this._dirtyRowService.markRangeDirty(this._bufferService.buffer.scrollTop, this._bufferService.buffer.scrollBottom);
        }));
        this._writeBuffer = new WriteBuffer_1.WriteBuffer((data, promiseResult) => this._inputHandler.parse(data, promiseResult));
        this.register((0, EventEmitter_1.forwardEvent)(this._writeBuffer.onWriteParsed, this._onWriteParsed));
    }
    get onBinary() { return this._onBinary.event; }
    get onData() { return this._onData.event; }
    get onLineFeed() { return this._onLineFeed.event; }
    get onResize() { return this._onResize.event; }
    get onWriteParsed() { return this._onWriteParsed.event; }
    get onScroll() {
        if (!this._onScrollApi) {
            this._onScrollApi = new EventEmitter_1.EventEmitter();
            this.register(this._onScroll.event(ev => {
                var _a;
                (_a = this._onScrollApi) === null || _a === void 0 ? void 0 : _a.fire(ev.position);
            }));
        }
        return this._onScrollApi.event;
    }
    get cols() { return this._bufferService.cols; }
    get rows() { return this._bufferService.rows; }
    get buffers() { return this._bufferService.buffers; }
    get options() { return this.optionsService.options; }
    set options(options) {
        for (const key in options) {
            this.optionsService.options[key] = options[key];
        }
    }
    dispose() {
        var _a;
        if (this._isDisposed) {
            return;
        }
        super.dispose();
        (_a = this._windowsMode) === null || _a === void 0 ? void 0 : _a.dispose();
        this._windowsMode = undefined;
    }
    write(data, callback) {
        this._writeBuffer.write(data, callback);
    }
    writeSync(data, maxSubsequentCalls) {
        if (this._logService.logLevel <= Services_1.LogLevelEnum.WARN && !hasWriteSyncWarnHappened) {
            this._logService.warn('writeSync is unreliable and will be removed soon.');
            hasWriteSyncWarnHappened = true;
        }
        this._writeBuffer.writeSync(data, maxSubsequentCalls);
    }
    resize(x, y) {
        if (isNaN(x) || isNaN(y)) {
            return;
        }
        x = Math.max(x, BufferService_1.MINIMUM_COLS);
        y = Math.max(y, BufferService_1.MINIMUM_ROWS);
        this._bufferService.resize(x, y);
    }
    scroll(eraseAttr, isWrapped = false) {
        this._bufferService.scroll(eraseAttr, isWrapped);
    }
    scrollLines(disp, suppressScrollEvent, source) {
        this._bufferService.scrollLines(disp, suppressScrollEvent, source);
    }
    scrollPages(pageCount) {
        this._bufferService.scrollPages(pageCount);
    }
    scrollToTop() {
        this._bufferService.scrollToTop();
    }
    scrollToBottom() {
        this._bufferService.scrollToBottom();
    }
    scrollToLine(line) {
        this._bufferService.scrollToLine(line);
    }
    registerEscHandler(id, callback) {
        return this._inputHandler.registerEscHandler(id, callback);
    }
    registerDcsHandler(id, callback) {
        return this._inputHandler.registerDcsHandler(id, callback);
    }
    registerCsiHandler(id, callback) {
        return this._inputHandler.registerCsiHandler(id, callback);
    }
    registerOscHandler(ident, callback) {
        return this._inputHandler.registerOscHandler(ident, callback);
    }
    _setup() {
        if (this.optionsService.rawOptions.windowsMode) {
            this._enableWindowsMode();
        }
    }
    reset() {
        this._inputHandler.reset();
        this._bufferService.reset();
        this._charsetService.reset();
        this.coreService.reset();
        this.coreMouseService.reset();
    }
    _updateOptions(key) {
        var _a;
        switch (key) {
            case 'scrollback':
                this.buffers.resize(this.cols, this.rows);
                break;
            case 'windowsMode':
                if (this.optionsService.rawOptions.windowsMode) {
                    this._enableWindowsMode();
                }
                else {
                    (_a = this._windowsMode) === null || _a === void 0 ? void 0 : _a.dispose();
                    this._windowsMode = undefined;
                }
                break;
        }
    }
    _enableWindowsMode() {
        if (!this._windowsMode) {
            const disposables = [];
            disposables.push(this.onLineFeed(WindowsMode_1.updateWindowsModeWrappedState.bind(null, this._bufferService)));
            disposables.push(this.registerCsiHandler({ final: 'H' }, () => {
                (0, WindowsMode_1.updateWindowsModeWrappedState)(this._bufferService);
                return false;
            }));
            this._windowsMode = {
                dispose: () => {
                    for (const d of disposables) {
                        d.dispose();
                    }
                }
            };
        }
    }
}
exports.CoreTerminal = CoreTerminal;
//# sourceMappingURL=CoreTerminal.js.map