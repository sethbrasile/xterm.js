"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessibilityManager = void 0;
const Strings = require("browser/LocalizableStrings");
const Platform_1 = require("common/Platform");
const TimeBasedDebouncer_1 = require("browser/TimeBasedDebouncer");
const Lifecycle_1 = require("browser/Lifecycle");
const Lifecycle_2 = require("common/Lifecycle");
const ScreenDprMonitor_1 = require("browser/ScreenDprMonitor");
const Dom_1 = require("browser/Dom");
const MAX_ROWS_TO_READ = 20;
class AccessibilityManager extends Lifecycle_2.Disposable {
    constructor(_terminal, _renderService) {
        super();
        this._terminal = _terminal;
        this._renderService = _renderService;
        this._liveRegionLineCount = 0;
        this._charsToConsume = [];
        this._charsToAnnounce = '';
        this._accessibilityTreeRoot = document.createElement('div');
        this._accessibilityTreeRoot.classList.add('xterm-accessibility');
        this._accessibilityTreeRoot.tabIndex = 0;
        this._rowContainer = document.createElement('div');
        this._rowContainer.setAttribute('role', 'list');
        this._rowContainer.classList.add('xterm-accessibility-tree');
        this._rowElements = [];
        for (let i = 0; i < this._terminal.rows; i++) {
            this._rowElements[i] = this._createAccessibilityTreeNode();
            this._rowContainer.appendChild(this._rowElements[i]);
        }
        this._topBoundaryFocusListener = e => this._onBoundaryFocus(e, 0);
        this._bottomBoundaryFocusListener = e => this._onBoundaryFocus(e, 1);
        this._rowElements[0].addEventListener('focus', this._topBoundaryFocusListener);
        this._rowElements[this._rowElements.length - 1].addEventListener('focus', this._bottomBoundaryFocusListener);
        this._refreshRowsDimensions();
        this._accessibilityTreeRoot.appendChild(this._rowContainer);
        this._renderRowsDebouncer = new TimeBasedDebouncer_1.TimeBasedDebouncer(this._renderRows.bind(this));
        this._refreshRows();
        this._liveRegion = document.createElement('div');
        this._liveRegion.classList.add('live-region');
        this._liveRegion.setAttribute('aria-live', 'assertive');
        this._accessibilityTreeRoot.appendChild(this._liveRegion);
        if (!this._terminal.element) {
            throw new Error('Cannot enable accessibility before Terminal.open');
        }
        this._terminal.element.insertAdjacentElement('afterbegin', this._accessibilityTreeRoot);
        this.register(this._renderRowsDebouncer);
        this.register(this._terminal.onResize(e => this._onResize(e.rows)));
        this.register(this._terminal.onRender(e => this._refreshRows(e.start, e.end)));
        this.register(this._terminal.onScroll(() => this._refreshRows()));
        this.register(this._terminal.onA11yChar(char => this._onChar(char)));
        this.register(this._terminal.onLineFeed(() => this._onChar('\n')));
        this.register(this._terminal.onA11yTab(spaceCount => this._onTab(spaceCount)));
        this.register(this._terminal.onKey(e => this._onKey(e.key)));
        this.register(this._terminal.onBlur(() => this._clearLiveRegion()));
        this.register(this._renderService.onDimensionsChange(() => this._refreshRowsDimensions()));
        this._screenDprMonitor = new ScreenDprMonitor_1.ScreenDprMonitor(window);
        this.register(this._screenDprMonitor);
        this._screenDprMonitor.setListener(() => this._refreshRowsDimensions());
        this.register((0, Lifecycle_1.addDisposableDomListener)(window, 'resize', () => this._refreshRowsDimensions()));
    }
    dispose() {
        super.dispose();
        (0, Dom_1.removeElementFromParent)(this._accessibilityTreeRoot);
        this._rowElements.length = 0;
    }
    _onBoundaryFocus(e, position) {
        const boundaryElement = e.target;
        const beforeBoundaryElement = this._rowElements[position === 0 ? 1 : this._rowElements.length - 2];
        const posInSet = boundaryElement.getAttribute('aria-posinset');
        const lastRowPos = position === 0 ? '1' : `${this._terminal.buffer.lines.length}`;
        if (posInSet === lastRowPos) {
            return;
        }
        if (e.relatedTarget !== beforeBoundaryElement) {
            return;
        }
        let topBoundaryElement;
        let bottomBoundaryElement;
        if (position === 0) {
            topBoundaryElement = boundaryElement;
            bottomBoundaryElement = this._rowElements.pop();
            this._rowContainer.removeChild(bottomBoundaryElement);
        }
        else {
            topBoundaryElement = this._rowElements.shift();
            bottomBoundaryElement = boundaryElement;
            this._rowContainer.removeChild(topBoundaryElement);
        }
        topBoundaryElement.removeEventListener('focus', this._topBoundaryFocusListener);
        bottomBoundaryElement.removeEventListener('focus', this._bottomBoundaryFocusListener);
        if (position === 0) {
            const newElement = this._createAccessibilityTreeNode();
            this._rowElements.unshift(newElement);
            this._rowContainer.insertAdjacentElement('afterbegin', newElement);
        }
        else {
            const newElement = this._createAccessibilityTreeNode();
            this._rowElements.push(newElement);
            this._rowContainer.appendChild(newElement);
        }
        this._rowElements[0].addEventListener('focus', this._topBoundaryFocusListener);
        this._rowElements[this._rowElements.length - 1].addEventListener('focus', this._bottomBoundaryFocusListener);
        this._terminal.scrollLines(position === 0 ? -1 : 1);
        this._rowElements[position === 0 ? 1 : this._rowElements.length - 2].focus();
        e.preventDefault();
        e.stopImmediatePropagation();
    }
    _onResize(rows) {
        this._rowElements[this._rowElements.length - 1].removeEventListener('focus', this._bottomBoundaryFocusListener);
        for (let i = this._rowContainer.children.length; i < this._terminal.rows; i++) {
            this._rowElements[i] = this._createAccessibilityTreeNode();
            this._rowContainer.appendChild(this._rowElements[i]);
        }
        while (this._rowElements.length > rows) {
            this._rowContainer.removeChild(this._rowElements.pop());
        }
        this._rowElements[this._rowElements.length - 1].addEventListener('focus', this._bottomBoundaryFocusListener);
        this._refreshRowsDimensions();
    }
    _createAccessibilityTreeNode() {
        const element = document.createElement('div');
        element.setAttribute('role', 'listitem');
        element.tabIndex = -1;
        this._refreshRowDimensions(element);
        return element;
    }
    _onTab(spaceCount) {
        for (let i = 0; i < spaceCount; i++) {
            this._onChar(' ');
        }
    }
    _onChar(char) {
        if (this._liveRegionLineCount < MAX_ROWS_TO_READ + 1) {
            if (this._charsToConsume.length > 0) {
                const shiftedChar = this._charsToConsume.shift();
                if (shiftedChar !== char) {
                    this._charsToAnnounce += char;
                }
            }
            else {
                this._charsToAnnounce += char;
            }
            if (char === '\n') {
                this._liveRegionLineCount++;
                if (this._liveRegionLineCount === MAX_ROWS_TO_READ + 1) {
                    this._liveRegion.textContent += Strings.tooMuchOutput;
                }
            }
            if (Platform_1.isMac) {
                if (this._liveRegion.textContent && this._liveRegion.textContent.length > 0 && !this._liveRegion.parentNode) {
                    setTimeout(() => {
                        this._accessibilityTreeRoot.appendChild(this._liveRegion);
                    }, 0);
                }
            }
        }
    }
    _clearLiveRegion() {
        this._liveRegion.textContent = '';
        this._liveRegionLineCount = 0;
        if (Platform_1.isMac) {
            (0, Dom_1.removeElementFromParent)(this._liveRegion);
        }
    }
    _onKey(keyChar) {
        this._clearLiveRegion();
        this._charsToConsume.push(keyChar);
    }
    _refreshRows(start, end) {
        this._renderRowsDebouncer.refresh(start, end, this._terminal.rows);
    }
    _renderRows(start, end) {
        const buffer = this._terminal.buffer;
        const setSize = buffer.lines.length.toString();
        for (let i = start; i <= end; i++) {
            const lineData = buffer.translateBufferLineToString(buffer.ydisp + i, true);
            const posInSet = (buffer.ydisp + i + 1).toString();
            const element = this._rowElements[i];
            if (element) {
                if (lineData.length === 0) {
                    element.innerText = '\u00a0';
                }
                else {
                    element.textContent = lineData;
                }
                element.setAttribute('aria-posinset', posInSet);
                element.setAttribute('aria-setsize', setSize);
            }
        }
        this._announceCharacters();
    }
    _refreshRowsDimensions() {
        if (!this._renderService.dimensions.actualCellHeight) {
            return;
        }
        if (this._rowElements.length !== this._terminal.rows) {
            this._onResize(this._terminal.rows);
        }
        for (let i = 0; i < this._terminal.rows; i++) {
            this._refreshRowDimensions(this._rowElements[i]);
        }
    }
    _refreshRowDimensions(element) {
        element.style.height = `${this._renderService.dimensions.actualCellHeight}px`;
    }
    _announceCharacters() {
        if (this._charsToAnnounce.length === 0) {
            return;
        }
        this._liveRegion.textContent += this._charsToAnnounce;
        this._charsToAnnounce = '';
    }
}
exports.AccessibilityManager = AccessibilityManager;
//# sourceMappingURL=AccessibilityManager.js.map