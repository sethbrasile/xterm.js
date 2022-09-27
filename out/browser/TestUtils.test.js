"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockSelectionService = exports.MockCharacterJoinerService = exports.MockRenderService = exports.MockMouseService = exports.MockCharSizeService = exports.MockCoreBrowserService = exports.MockCompositionHelper = exports.MockViewport = exports.MockRenderer = exports.MockBuffer = exports.MockTerminal = exports.TestTerminal = void 0;
const EventEmitter_1 = require("common/EventEmitter");
const Buffer_1 = require("common/buffer/Buffer");
const Browser = require("common/Platform");
const Terminal_1 = require("browser/Terminal");
const AttributeData_1 = require("common/buffer/AttributeData");
class TestTerminal extends Terminal_1.Terminal {
    get curAttrData() { return this._inputHandler._curAttrData; }
    keyDown(ev) { return this._keyDown(ev); }
    keyPress(ev) { return this._keyPress(ev); }
    writeP(data) {
        return new Promise(r => this.write(data, r));
    }
}
exports.TestTerminal = TestTerminal;
class MockTerminal {
    constructor() {
        this.browser = Browser;
    }
    addMarker(cursorYOffset) {
        throw new Error('Method not implemented.');
    }
    selectLines(start, end) {
        throw new Error('Method not implemented.');
    }
    scrollToLine(line) {
        throw new Error('Method not implemented.');
    }
    setOption(key, value) {
        throw new Error('Method not implemented.');
    }
    blur() {
        throw new Error('Method not implemented.');
    }
    focus() {
        throw new Error('Method not implemented.');
    }
    resize(columns, rows) {
        throw new Error('Method not implemented.');
    }
    writeln(data) {
        throw new Error('Method not implemented.');
    }
    paste(data) {
        throw new Error('Method not implemented.');
    }
    open(parent) {
        throw new Error('Method not implemented.');
    }
    attachCustomKeyEventHandler(customKeyEventHandler) {
        throw new Error('Method not implemented.');
    }
    registerCsiHandler(id, callback) {
        throw new Error('Method not implemented.');
    }
    registerDcsHandler(id, callback) {
        throw new Error('Method not implemented.');
    }
    registerEscHandler(id, handler) {
        throw new Error('Method not implemented.');
    }
    registerOscHandler(ident, callback) {
        throw new Error('Method not implemented.');
    }
    registerLinkProvider(linkProvider) {
        throw new Error('Method not implemented.');
    }
    registerDecoration(decorationOptions) {
        throw new Error('Method not implemented.');
    }
    hasSelection() {
        throw new Error('Method not implemented.');
    }
    getSelection() {
        throw new Error('Method not implemented.');
    }
    getSelectionPosition() {
        throw new Error('Method not implemented.');
    }
    clearSelection() {
        throw new Error('Method not implemented.');
    }
    select(column, row, length) {
        throw new Error('Method not implemented.');
    }
    selectAll() {
        throw new Error('Method not implemented.');
    }
    dispose() {
        throw new Error('Method not implemented.');
    }
    scrollPages(pageCount) {
        throw new Error('Method not implemented.');
    }
    scrollToTop() {
        throw new Error('Method not implemented.');
    }
    scrollToBottom() {
        throw new Error('Method not implemented.');
    }
    clear() {
        throw new Error('Method not implemented.');
    }
    write(data) {
        throw new Error('Method not implemented.');
    }
    handler(data) {
        throw new Error('Method not implemented.');
    }
    on(event, callback) {
        throw new Error('Method not implemented.');
    }
    off(type, listener) {
        throw new Error('Method not implemented.');
    }
    addDisposableListener(type, handler) {
        throw new Error('Method not implemented.');
    }
    scrollLines(disp) {
        throw new Error('Method not implemented.');
    }
    scrollToRow(absoluteRow) {
        throw new Error('Method not implemented.');
    }
    cancel(ev, force) {
        throw new Error('Method not implemented.');
    }
    log(text) {
        throw new Error('Method not implemented.');
    }
    emit(event, data) {
        throw new Error('Method not implemented.');
    }
    reset() {
        throw new Error('Method not implemented.');
    }
    clearTextureAtlas() {
        throw new Error('Method not implemented.');
    }
    refresh(start, end) {
        throw new Error('Method not implemented.');
    }
    registerCharacterJoiner(handler) { return 0; }
    deregisterCharacterJoiner(joinerId) { }
}
exports.MockTerminal = MockTerminal;
class MockBuffer {
    constructor() {
        this.savedCurAttrData = new AttributeData_1.AttributeData();
    }
    addMarker(y) {
        throw new Error('Method not implemented.');
    }
    translateBufferLineToString(lineIndex, trimRight, startCol, endCol) {
        return Buffer_1.Buffer.prototype.translateBufferLineToString.apply(this, arguments);
    }
    getWrappedRangeForLine(y) {
        return Buffer_1.Buffer.prototype.getWrappedRangeForLine.apply(this, arguments);
    }
    nextStop(x) {
        throw new Error('Method not implemented.');
    }
    prevStop(x) {
        throw new Error('Method not implemented.');
    }
    setLines(lines) {
        this.lines = lines;
    }
    getBlankLine(attr, isWrapped) {
        return Buffer_1.Buffer.prototype.getBlankLine.apply(this, arguments);
    }
    stringIndexToBufferIndex(lineIndex, stringIndex) {
        return Buffer_1.Buffer.prototype.stringIndexToBufferIndex.apply(this, arguments);
    }
    iterator(trimRight, startIndex, endIndex) {
        return Buffer_1.Buffer.prototype.iterator.apply(this, arguments);
    }
    getNullCell(attr) {
        throw new Error('Method not implemented.');
    }
    getWhitespaceCell(attr) {
        throw new Error('Method not implemented.');
    }
    clearMarkers(y) {
        throw new Error('Method not implemented.');
    }
    clearAllMarkers() {
        throw new Error('Method not implemented.');
    }
}
exports.MockBuffer = MockBuffer;
class MockRenderer {
    dispose() {
        throw new Error('Method not implemented.');
    }
    on(type, listener) {
        throw new Error('Method not implemented.');
    }
    off(type, listener) {
        throw new Error('Method not implemented.');
    }
    emit(type, data) {
        throw new Error('Method not implemented.');
    }
    addDisposableListener(type, handler) {
        throw new Error('Method not implemented.');
    }
    setColors(colors) {
        throw new Error('Method not implemented.');
    }
    registerDecoration(decorationOptions) {
        throw new Error('Method not implemented.');
    }
    onResize(cols, rows) { }
    onCharSizeChanged() { }
    onBlur() { }
    onFocus() { }
    onSelectionChanged(start, end) { }
    onCursorMove() { }
    onOptionsChanged() { }
    onDevicePixelRatioChange() { }
    clear() { }
    renderRows(start, end) { }
}
exports.MockRenderer = MockRenderer;
class MockViewport {
    constructor() {
        this.scrollBarWidth = 0;
    }
    dispose() {
        throw new Error('Method not implemented.');
    }
    onThemeChange(colors) {
        throw new Error('Method not implemented.');
    }
    onWheel(ev) {
        throw new Error('Method not implemented.');
    }
    onTouchStart(ev) {
        throw new Error('Method not implemented.');
    }
    onTouchMove(ev) {
        throw new Error('Method not implemented.');
    }
    syncScrollArea() { }
    getLinesScrolled(ev) {
        throw new Error('Method not implemented.');
    }
}
exports.MockViewport = MockViewport;
class MockCompositionHelper {
    get isComposing() {
        return false;
    }
    compositionstart() {
        throw new Error('Method not implemented.');
    }
    compositionupdate(ev) {
        throw new Error('Method not implemented.');
    }
    compositionend() {
        throw new Error('Method not implemented.');
    }
    updateCompositionElements(dontRecurse) {
        throw new Error('Method not implemented.');
    }
    keydown(ev) {
        return true;
    }
}
exports.MockCompositionHelper = MockCompositionHelper;
class MockCoreBrowserService {
    constructor() {
        this.isFocused = true;
        this.dpr = 1;
    }
    get window() {
        throw Error('Window object not available in tests');
    }
}
exports.MockCoreBrowserService = MockCoreBrowserService;
class MockCharSizeService {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.onCharSizeChange = new EventEmitter_1.EventEmitter().event;
    }
    get hasValidSize() { return this.width > 0 && this.height > 0; }
    measure() { }
}
exports.MockCharSizeService = MockCharSizeService;
class MockMouseService {
    getCoords(event, element, colCount, rowCount, isSelection) {
        throw new Error('Not implemented');
    }
    getMouseReportCoords(event, element) {
        throw new Error('Not implemented');
    }
}
exports.MockMouseService = MockMouseService;
class MockRenderService {
    constructor() {
        this.onDimensionsChange = new EventEmitter_1.EventEmitter().event;
        this.onRenderedViewportChange = new EventEmitter_1.EventEmitter().event;
        this.onRender = new EventEmitter_1.EventEmitter().event;
        this.onRefreshRequest = new EventEmitter_1.EventEmitter().event;
        this.dimensions = {
            scaledCharWidth: 0,
            scaledCharHeight: 0,
            scaledCellWidth: 0,
            scaledCellHeight: 0,
            scaledCharLeft: 0,
            scaledCharTop: 0,
            scaledCanvasWidth: 0,
            scaledCanvasHeight: 0,
            canvasWidth: 0,
            canvasHeight: 0,
            actualCellWidth: 0,
            actualCellHeight: 0
        };
    }
    refreshRows(start, end) {
        throw new Error('Method not implemented.');
    }
    addRefreshCallback(callback) {
        throw new Error('Method not implemented.');
    }
    clearTextureAtlas() {
        throw new Error('Method not implemented.');
    }
    resize(cols, rows) {
        throw new Error('Method not implemented.');
    }
    setRenderer(renderer) {
        throw new Error('Method not implemented.');
    }
    setColors(colors) {
        throw new Error('Method not implemented.');
    }
    onDevicePixelRatioChange() {
        throw new Error('Method not implemented.');
    }
    onResize(cols, rows) {
        throw new Error('Method not implemented.');
    }
    onCharSizeChanged() {
        throw new Error('Method not implemented.');
    }
    onBlur() {
        throw new Error('Method not implemented.');
    }
    onFocus() {
        throw new Error('Method not implemented.');
    }
    onSelectionChanged(start, end, columnSelectMode) {
        throw new Error('Method not implemented.');
    }
    onCursorMove() {
        throw new Error('Method not implemented.');
    }
    clear() {
        throw new Error('Method not implemented.');
    }
    dispose() {
        throw new Error('Method not implemented.');
    }
    registerDecoration(decorationOptions) {
        throw new Error('Method not implemented.');
    }
}
exports.MockRenderService = MockRenderService;
class MockCharacterJoinerService {
    register(handler) {
        return 0;
    }
    deregister(joinerId) {
        return true;
    }
    getJoinedCharacters(row) {
        return [];
    }
}
exports.MockCharacterJoinerService = MockCharacterJoinerService;
class MockSelectionService {
    constructor() {
        this.selectionText = '';
        this.hasSelection = false;
        this.onLinuxMouseSelection = new EventEmitter_1.EventEmitter().event;
        this.onRequestRedraw = new EventEmitter_1.EventEmitter().event;
        this.onRequestScrollLines = new EventEmitter_1.EventEmitter().event;
        this.onSelectionChange = new EventEmitter_1.EventEmitter().event;
    }
    disable() {
        throw new Error('Method not implemented.');
    }
    enable() {
        throw new Error('Method not implemented.');
    }
    reset() {
        throw new Error('Method not implemented.');
    }
    setSelection(row, col, length) {
        throw new Error('Method not implemented.');
    }
    selectAll() {
        throw new Error('Method not implemented.');
    }
    selectLines(start, end) {
        throw new Error('Method not implemented.');
    }
    clearSelection() {
        throw new Error('Method not implemented.');
    }
    rightClickSelect(event) {
        throw new Error('Method not implemented.');
    }
    shouldColumnSelect(event) {
        throw new Error('Method not implemented.');
    }
    shouldForceSelection(event) {
        throw new Error('Method not implemented.');
    }
    refresh(isLinuxMouseSelection) {
        throw new Error('Method not implemented.');
    }
    onMouseDown(event) {
        throw new Error('Method not implemented.');
    }
    isCellInSelection(x, y) {
        return false;
    }
}
exports.MockSelectionService = MockSelectionService;
//# sourceMappingURL=TestUtils.test.js.map