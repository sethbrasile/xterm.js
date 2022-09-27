"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Terminal = void 0;
const BufferNamespaceApi_1 = require("common/public/BufferNamespaceApi");
const ParserApi_1 = require("common/public/ParserApi");
const UnicodeApi_1 = require("common/public/UnicodeApi");
const Terminal_1 = require("headless/Terminal");
const AddonManager_1 = require("common/public/AddonManager");
const CONSTRUCTOR_ONLY_OPTIONS = ['cols', 'rows'];
class Terminal {
    constructor(options) {
        this._core = new Terminal_1.Terminal(options);
        this._addonManager = new AddonManager_1.AddonManager();
        this._publicOptions = Object.assign({}, this._core.options);
        const getter = (propName) => {
            return this._core.options[propName];
        };
        const setter = (propName, value) => {
            this._checkReadonlyOptions(propName);
            this._core.options[propName] = value;
        };
        for (const propName in this._core.options) {
            Object.defineProperty(this._publicOptions, propName, {
                get: () => {
                    return this._core.options[propName];
                },
                set: (value) => {
                    this._checkReadonlyOptions(propName);
                    this._core.options[propName] = value;
                }
            });
            const desc = {
                get: getter.bind(this, propName),
                set: setter.bind(this, propName)
            };
            Object.defineProperty(this._publicOptions, propName, desc);
        }
    }
    _checkReadonlyOptions(propName) {
        if (CONSTRUCTOR_ONLY_OPTIONS.includes(propName)) {
            throw new Error(`Option "${propName}" can only be set in the constructor`);
        }
    }
    _checkProposedApi() {
        if (!this._core.optionsService.options.allowProposedApi) {
            throw new Error('You must set the allowProposedApi option to true to use proposed API');
        }
    }
    get onBell() { return this._core.onBell; }
    get onBinary() { return this._core.onBinary; }
    get onCursorMove() { return this._core.onCursorMove; }
    get onData() { return this._core.onData; }
    get onLineFeed() { return this._core.onLineFeed; }
    get onResize() { return this._core.onResize; }
    get onScroll() { return this._core.onScroll; }
    get onTitleChange() { return this._core.onTitleChange; }
    get parser() {
        this._checkProposedApi();
        if (!this._parser) {
            this._parser = new ParserApi_1.ParserApi(this._core);
        }
        return this._parser;
    }
    get unicode() {
        this._checkProposedApi();
        return new UnicodeApi_1.UnicodeApi(this._core);
    }
    get rows() { return this._core.rows; }
    get cols() { return this._core.cols; }
    get buffer() {
        this._checkProposedApi();
        if (!this._buffer) {
            this._buffer = new BufferNamespaceApi_1.BufferNamespaceApi(this._core);
        }
        return this._buffer;
    }
    get markers() {
        this._checkProposedApi();
        return this._core.markers;
    }
    get modes() {
        const m = this._core.coreService.decPrivateModes;
        let mouseTrackingMode = 'none';
        switch (this._core.coreMouseService.activeProtocol) {
            case 'X10':
                mouseTrackingMode = 'x10';
                break;
            case 'VT200':
                mouseTrackingMode = 'vt200';
                break;
            case 'DRAG':
                mouseTrackingMode = 'drag';
                break;
            case 'ANY':
                mouseTrackingMode = 'any';
                break;
        }
        return {
            applicationCursorKeysMode: m.applicationCursorKeys,
            applicationKeypadMode: m.applicationKeypad,
            bracketedPasteMode: m.bracketedPasteMode,
            insertMode: this._core.coreService.modes.insertMode,
            mouseTrackingMode: mouseTrackingMode,
            originMode: m.origin,
            reverseWraparoundMode: m.reverseWraparound,
            sendFocusMode: m.sendFocus,
            wraparoundMode: m.wraparound
        };
    }
    get options() {
        return this._publicOptions;
    }
    set options(options) {
        for (const propName in options) {
            this._publicOptions[propName] = options[propName];
        }
    }
    resize(columns, rows) {
        this._verifyIntegers(columns, rows);
        this._core.resize(columns, rows);
    }
    registerMarker(cursorYOffset = 0) {
        this._checkProposedApi();
        this._verifyIntegers(cursorYOffset);
        return this._core.addMarker(cursorYOffset);
    }
    addMarker(cursorYOffset) {
        return this.registerMarker(cursorYOffset);
    }
    dispose() {
        this._addonManager.dispose();
        this._core.dispose();
    }
    scrollLines(amount) {
        this._verifyIntegers(amount);
        this._core.scrollLines(amount);
    }
    scrollPages(pageCount) {
        this._verifyIntegers(pageCount);
        this._core.scrollPages(pageCount);
    }
    scrollToTop() {
        this._core.scrollToTop();
    }
    scrollToBottom() {
        this._core.scrollToBottom();
    }
    scrollToLine(line) {
        this._verifyIntegers(line);
        this._core.scrollToLine(line);
    }
    clear() {
        this._core.clear();
    }
    write(data, callback) {
        this._core.write(data, callback);
    }
    writeln(data, callback) {
        this._core.write(data);
        this._core.write('\r\n', callback);
    }
    reset() {
        this._core.reset();
    }
    loadAddon(addon) {
        return this._addonManager.loadAddon(this, addon);
    }
    _verifyIntegers(...values) {
        for (const value of values) {
            if (value === Infinity || isNaN(value) || value % 1 !== 0) {
                throw new Error('This API only accepts integers');
            }
        }
    }
}
exports.Terminal = Terminal;
//# sourceMappingURL=Terminal.js.map