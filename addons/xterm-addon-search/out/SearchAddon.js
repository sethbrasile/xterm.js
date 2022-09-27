"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchAddon = void 0;
const EventEmitter_1 = require("common/EventEmitter");
const NON_WORD_CHARACTERS = ' ~!@#$%^&*()+`-=[]{}|\\;:"\',./<>?';
const LINES_CACHE_TIME_TO_LIVE = 15 * 1000;
class SearchAddon {
    constructor() {
        this._linesCacheTimeoutId = 0;
        this._onDidChangeResults = new EventEmitter_1.EventEmitter();
        this.onDidChangeResults = this._onDidChangeResults.event;
    }
    activate(terminal) {
        this._terminal = terminal;
        this._onDataDisposable = this._terminal.onWriteParsed(() => this._updateMatches());
        this._onResizeDisposable = this._terminal.onResize(() => this._updateMatches());
    }
    _updateMatches() {
        var _a;
        if (this._highlightTimeout) {
            window.clearTimeout(this._highlightTimeout);
        }
        if (this._cachedSearchTerm && ((_a = this._lastSearchOptions) === null || _a === void 0 ? void 0 : _a.decorations)) {
            this._highlightTimeout = setTimeout(() => {
                var _a, _b;
                this.findPrevious(this._cachedSearchTerm, Object.assign(Object.assign({}, this._lastSearchOptions), { incremental: true, noScroll: true }));
                this._resultIndex = this._searchResults ? this._searchResults.size - 1 : -1;
                this._onDidChangeResults.fire({ resultIndex: this._resultIndex, resultCount: (_b = (_a = this._searchResults) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : -1 });
            }, 200);
        }
    }
    dispose() {
        var _a, _b;
        this.clearDecorations();
        (_a = this._onDataDisposable) === null || _a === void 0 ? void 0 : _a.dispose();
        (_b = this._onResizeDisposable) === null || _b === void 0 ? void 0 : _b.dispose();
    }
    clearDecorations(retainCachedSearchTerm) {
        var _a, _b, _c, _d;
        (_a = this._selectedDecoration) === null || _a === void 0 ? void 0 : _a.dispose();
        (_b = this._searchResults) === null || _b === void 0 ? void 0 : _b.clear();
        (_c = this._resultDecorations) === null || _c === void 0 ? void 0 : _c.forEach(decorations => {
            for (const d of decorations) {
                d.dispose();
            }
        });
        (_d = this._resultDecorations) === null || _d === void 0 ? void 0 : _d.clear();
        this._searchResults = undefined;
        this._resultDecorations = undefined;
        if (!retainCachedSearchTerm) {
            this._cachedSearchTerm = undefined;
        }
    }
    clearActiveDecoration() {
        var _a;
        (_a = this._selectedDecoration) === null || _a === void 0 ? void 0 : _a.dispose();
        this._selectedDecoration = undefined;
    }
    findNext(term, searchOptions) {
        if (!this._terminal) {
            throw new Error('Cannot use addon until it has been loaded');
        }
        this._lastSearchOptions = searchOptions;
        if (searchOptions === null || searchOptions === void 0 ? void 0 : searchOptions.decorations) {
            if (this._resultIndex !== undefined || this._cachedSearchTerm === undefined || term !== this._cachedSearchTerm) {
                this._highlightAllMatches(term, searchOptions);
            }
        }
        return this._fireResults(term, this._findNextAndSelect(term, searchOptions), searchOptions);
    }
    _highlightAllMatches(term, searchOptions) {
        if (!this._terminal) {
            throw new Error('Cannot use addon until it has been loaded');
        }
        if (!term || term.length === 0) {
            this.clearDecorations();
            return;
        }
        searchOptions = searchOptions || {};
        this.clearDecorations(true);
        this._searchResults = new Map();
        this._resultDecorations = new Map();
        const resultDecorations = this._resultDecorations;
        let result = this._find(term, 0, 0, searchOptions);
        while (result && !this._searchResults.get(`${result.row}-${result.col}`)) {
            this._searchResults.set(`${result.row}-${result.col}`, result);
            result = this._find(term, result.col + result.term.length >= this._terminal.cols ? result.row + 1 : result.row, result.col + result.term.length >= this._terminal.cols ? 0 : result.col + 1, searchOptions);
            if (this._searchResults.size > 1000) {
                this.clearDecorations();
                this._resultIndex = undefined;
                return;
            }
        }
        this._searchResults.forEach(result => {
            const resultDecoration = this._createResultDecoration(result, searchOptions.decorations);
            if (resultDecoration) {
                const decorationsForLine = resultDecorations.get(resultDecoration.marker.line) || [];
                decorationsForLine.push(resultDecoration);
                resultDecorations.set(resultDecoration.marker.line, decorationsForLine);
            }
        });
    }
    _find(term, startRow, startCol, searchOptions) {
        var _a;
        if (!this._terminal || !term || term.length === 0) {
            (_a = this._terminal) === null || _a === void 0 ? void 0 : _a.clearSelection();
            this.clearDecorations();
            return undefined;
        }
        if (startCol > this._terminal.cols) {
            throw new Error(`Invalid col: ${startCol} to search in terminal of ${this._terminal.cols} cols`);
        }
        let result = undefined;
        this._initLinesCache();
        const searchPosition = {
            startRow,
            startCol
        };
        result = this._findInLine(term, searchPosition, searchOptions);
        if (!result) {
            for (let y = startRow + 1; y < this._terminal.buffer.active.baseY + this._terminal.rows; y++) {
                searchPosition.startRow = y;
                searchPosition.startCol = 0;
                result = this._findInLine(term, searchPosition, searchOptions);
                if (result) {
                    break;
                }
            }
        }
        return result;
    }
    _findNextAndSelect(term, searchOptions) {
        var _a;
        if (!this._terminal || !term || term.length === 0) {
            (_a = this._terminal) === null || _a === void 0 ? void 0 : _a.clearSelection();
            this.clearDecorations();
            this._cachedSearchTerm = undefined;
            this._resultIndex = -1;
            return false;
        }
        if (this._cachedSearchTerm !== term) {
            this._resultIndex = undefined;
            this._terminal.clearSelection();
        }
        let startCol = 0;
        let startRow = 0;
        let currentSelection;
        if (this._terminal.hasSelection()) {
            const incremental = searchOptions ? searchOptions.incremental : false;
            currentSelection = this._terminal.getSelectionPosition();
            startRow = incremental ? currentSelection.start.y : currentSelection.end.y;
            startCol = incremental ? currentSelection.start.x : currentSelection.end.x;
        }
        this._initLinesCache();
        const searchPosition = {
            startRow,
            startCol
        };
        let result = this._findInLine(term, searchPosition, searchOptions);
        if (!result) {
            for (let y = startRow + 1; y < this._terminal.buffer.active.baseY + this._terminal.rows; y++) {
                searchPosition.startRow = y;
                searchPosition.startCol = 0;
                result = this._findInLine(term, searchPosition, searchOptions);
                if (result) {
                    break;
                }
            }
        }
        if (!result && startRow !== 0) {
            for (let y = 0; y < startRow; y++) {
                searchPosition.startRow = y;
                searchPosition.startCol = 0;
                result = this._findInLine(term, searchPosition, searchOptions);
                if (result) {
                    break;
                }
            }
        }
        if (!result && currentSelection) {
            searchPosition.startRow = currentSelection.start.y;
            searchPosition.startCol = 0;
            result = this._findInLine(term, searchPosition, searchOptions);
        }
        if (this._searchResults) {
            if (this._searchResults.size === 0) {
                this._resultIndex = -1;
            }
            else if (this._resultIndex === undefined) {
                this._resultIndex = 0;
            }
            else {
                this._resultIndex++;
                if (this._resultIndex >= this._searchResults.size) {
                    this._resultIndex = 0;
                }
            }
        }
        return this._selectResult(result, searchOptions === null || searchOptions === void 0 ? void 0 : searchOptions.decorations, searchOptions === null || searchOptions === void 0 ? void 0 : searchOptions.noScroll);
    }
    findPrevious(term, searchOptions) {
        if (!this._terminal) {
            throw new Error('Cannot use addon until it has been loaded');
        }
        this._lastSearchOptions = searchOptions;
        if (searchOptions === null || searchOptions === void 0 ? void 0 : searchOptions.decorations) {
            if (this._resultIndex !== undefined || this._cachedSearchTerm === undefined || term !== this._cachedSearchTerm) {
                this._highlightAllMatches(term, searchOptions);
            }
        }
        return this._fireResults(term, this._findPreviousAndSelect(term, searchOptions), searchOptions);
    }
    _fireResults(term, found, searchOptions) {
        var _a;
        if (searchOptions === null || searchOptions === void 0 ? void 0 : searchOptions.decorations) {
            if (this._resultIndex !== undefined && ((_a = this._searchResults) === null || _a === void 0 ? void 0 : _a.size) !== undefined) {
                this._onDidChangeResults.fire({ resultIndex: this._resultIndex, resultCount: this._searchResults.size });
            }
            else {
                this._onDidChangeResults.fire(undefined);
            }
        }
        this._cachedSearchTerm = term;
        return found;
    }
    _findPreviousAndSelect(term, searchOptions) {
        var _a;
        if (!this._terminal) {
            throw new Error('Cannot use addon until it has been loaded');
        }
        let result;
        if (!this._terminal || !term || term.length === 0) {
            result = undefined;
            (_a = this._terminal) === null || _a === void 0 ? void 0 : _a.clearSelection();
            this.clearDecorations();
            this._resultIndex = -1;
            return false;
        }
        if (this._cachedSearchTerm !== term) {
            this._resultIndex = undefined;
            this._terminal.clearSelection();
        }
        let startRow = this._terminal.buffer.active.baseY + this._terminal.rows;
        let startCol = this._terminal.cols;
        const isReverseSearch = true;
        const incremental = searchOptions ? searchOptions.incremental : false;
        let currentSelection;
        if (this._terminal.hasSelection()) {
            currentSelection = this._terminal.getSelectionPosition();
            startRow = currentSelection.start.y;
            startCol = currentSelection.start.x;
        }
        this._initLinesCache();
        const searchPosition = {
            startRow,
            startCol
        };
        if (incremental) {
            result = this._findInLine(term, searchPosition, searchOptions, false);
            const isOldResultHighlighted = result && result.row === startRow && result.col === startCol;
            if (!isOldResultHighlighted) {
                if (currentSelection) {
                    searchPosition.startRow = currentSelection.end.y;
                    searchPosition.startCol = currentSelection.end.x;
                }
                result = this._findInLine(term, searchPosition, searchOptions, true);
            }
        }
        else {
            result = this._findInLine(term, searchPosition, searchOptions, isReverseSearch);
        }
        if (!result) {
            searchPosition.startCol = Math.max(searchPosition.startCol, this._terminal.cols);
            for (let y = startRow - 1; y >= 0; y--) {
                searchPosition.startRow = y;
                result = this._findInLine(term, searchPosition, searchOptions, isReverseSearch);
                if (result) {
                    break;
                }
            }
        }
        if (!result && startRow !== (this._terminal.buffer.active.baseY + this._terminal.rows)) {
            for (let y = (this._terminal.buffer.active.baseY + this._terminal.rows); y >= startRow; y--) {
                searchPosition.startRow = y;
                result = this._findInLine(term, searchPosition, searchOptions, isReverseSearch);
                if (result) {
                    break;
                }
            }
        }
        if (this._searchResults) {
            if (this._searchResults.size === 0) {
                this._resultIndex = -1;
            }
            else if (this._resultIndex === undefined || this._resultIndex < 0) {
                this._resultIndex = this._searchResults.size - 1;
            }
            else {
                this._resultIndex--;
                if (this._resultIndex === -1) {
                    this._resultIndex = this._searchResults.size - 1;
                }
            }
        }
        if (!result && currentSelection)
            return true;
        return this._selectResult(result, searchOptions === null || searchOptions === void 0 ? void 0 : searchOptions.decorations, searchOptions === null || searchOptions === void 0 ? void 0 : searchOptions.noScroll);
    }
    _initLinesCache() {
        const terminal = this._terminal;
        if (!this._linesCache) {
            this._linesCache = new Array(terminal.buffer.active.length);
            this._cursorMoveListener = terminal.onCursorMove(() => this._destroyLinesCache());
            this._resizeListener = terminal.onResize(() => this._destroyLinesCache());
        }
        window.clearTimeout(this._linesCacheTimeoutId);
        this._linesCacheTimeoutId = window.setTimeout(() => this._destroyLinesCache(), LINES_CACHE_TIME_TO_LIVE);
    }
    _destroyLinesCache() {
        this._linesCache = undefined;
        if (this._cursorMoveListener) {
            this._cursorMoveListener.dispose();
            this._cursorMoveListener = undefined;
        }
        if (this._resizeListener) {
            this._resizeListener.dispose();
            this._resizeListener = undefined;
        }
        if (this._linesCacheTimeoutId) {
            window.clearTimeout(this._linesCacheTimeoutId);
            this._linesCacheTimeoutId = 0;
        }
    }
    _isWholeWord(searchIndex, line, term) {
        return ((searchIndex === 0) || (NON_WORD_CHARACTERS.includes(line[searchIndex - 1]))) &&
            (((searchIndex + term.length) === line.length) || (NON_WORD_CHARACTERS.includes(line[searchIndex + term.length])));
    }
    _findInLine(term, searchPosition, searchOptions = {}, isReverseSearch = false) {
        var _a;
        const terminal = this._terminal;
        const row = searchPosition.startRow;
        const col = searchPosition.startCol;
        const firstLine = terminal.buffer.active.getLine(row);
        if (firstLine === null || firstLine === void 0 ? void 0 : firstLine.isWrapped) {
            if (isReverseSearch) {
                searchPosition.startCol += terminal.cols;
                return;
            }
            searchPosition.startRow--;
            searchPosition.startCol += terminal.cols;
            return this._findInLine(term, searchPosition, searchOptions);
        }
        let cache = (_a = this._linesCache) === null || _a === void 0 ? void 0 : _a[row];
        if (!cache) {
            cache = this._translateBufferLineToStringWithWrap(row, true);
            if (this._linesCache) {
                this._linesCache[row] = cache;
            }
        }
        const [stringLine, offsets] = cache;
        const offset = this._bufferColsToStringOffset(row, col);
        const searchTerm = searchOptions.caseSensitive ? term : term.toLowerCase();
        const searchStringLine = searchOptions.caseSensitive ? stringLine : stringLine.toLowerCase();
        let resultIndex = -1;
        if (searchOptions.regex) {
            const searchRegex = RegExp(searchTerm, 'g');
            let foundTerm;
            if (isReverseSearch) {
                while (foundTerm = searchRegex.exec(searchStringLine.slice(0, offset))) {
                    resultIndex = searchRegex.lastIndex - foundTerm[0].length;
                    term = foundTerm[0];
                    searchRegex.lastIndex -= (term.length - 1);
                }
            }
            else {
                foundTerm = searchRegex.exec(searchStringLine.slice(offset));
                if (foundTerm && foundTerm[0].length > 0) {
                    resultIndex = offset + (searchRegex.lastIndex - foundTerm[0].length);
                    term = foundTerm[0];
                }
            }
        }
        else {
            if (isReverseSearch) {
                if (offset - searchTerm.length >= 0) {
                    resultIndex = searchStringLine.lastIndexOf(searchTerm, offset - searchTerm.length);
                }
            }
            else {
                resultIndex = searchStringLine.indexOf(searchTerm, offset);
            }
        }
        if (resultIndex >= 0) {
            if (searchOptions.wholeWord && !this._isWholeWord(resultIndex, searchStringLine, term)) {
                return;
            }
            let startRowOffset = 0;
            while (startRowOffset < offsets.length - 1 && resultIndex >= offsets[startRowOffset + 1]) {
                startRowOffset++;
            }
            let endRowOffset = startRowOffset;
            while (endRowOffset < offsets.length - 1 && resultIndex + term.length >= offsets[endRowOffset + 1]) {
                endRowOffset++;
            }
            const startColOffset = resultIndex - offsets[startRowOffset];
            const endColOffset = resultIndex + term.length - offsets[endRowOffset];
            const startColIndex = this._stringLengthToBufferSize(row + startRowOffset, startColOffset);
            const endColIndex = this._stringLengthToBufferSize(row + endRowOffset, endColOffset);
            const size = endColIndex - startColIndex + terminal.cols * (endRowOffset - startRowOffset);
            return {
                term,
                col: startColIndex,
                row: row + startRowOffset,
                size
            };
        }
    }
    _stringLengthToBufferSize(row, offset) {
        const line = this._terminal.buffer.active.getLine(row);
        if (!line) {
            return 0;
        }
        for (let i = 0; i < offset; i++) {
            const cell = line.getCell(i);
            if (!cell) {
                break;
            }
            const char = cell.getChars();
            if (char.length > 1) {
                offset -= char.length - 1;
            }
            const nextCell = line.getCell(i + 1);
            if (nextCell && nextCell.getWidth() === 0) {
                offset++;
            }
        }
        return offset;
    }
    _bufferColsToStringOffset(startRow, cols) {
        const terminal = this._terminal;
        let lineIndex = startRow;
        let offset = 0;
        let line = terminal.buffer.active.getLine(lineIndex);
        while (cols > 0 && line) {
            for (let i = 0; i < cols && i < terminal.cols; i++) {
                const cell = line.getCell(i);
                if (!cell) {
                    break;
                }
                if (cell.getWidth()) {
                    offset += cell.getCode() === 0 ? 1 : cell.getChars().length;
                }
            }
            lineIndex++;
            line = terminal.buffer.active.getLine(lineIndex);
            if (line && !line.isWrapped) {
                break;
            }
            cols -= terminal.cols;
        }
        return offset;
    }
    _translateBufferLineToStringWithWrap(lineIndex, trimRight) {
        var _a;
        const terminal = this._terminal;
        const strings = [];
        const lineOffsets = [0];
        let line = terminal.buffer.active.getLine(lineIndex);
        while (line) {
            const nextLine = terminal.buffer.active.getLine(lineIndex + 1);
            const lineWrapsToNext = nextLine ? nextLine.isWrapped : false;
            let string = line.translateToString(!lineWrapsToNext && trimRight);
            if (lineWrapsToNext && nextLine) {
                const lastCell = line.getCell(line.length - 1);
                const lastCellIsNull = lastCell && lastCell.getCode() === 0 && lastCell.getWidth() === 1;
                if (lastCellIsNull && ((_a = nextLine.getCell(0)) === null || _a === void 0 ? void 0 : _a.getWidth()) === 2) {
                    string = string.slice(0, -1);
                }
            }
            strings.push(string);
            if (lineWrapsToNext) {
                lineOffsets.push(lineOffsets[lineOffsets.length - 1] + string.length);
            }
            else {
                break;
            }
            lineIndex++;
            line = nextLine;
        }
        return [strings.join(''), lineOffsets];
    }
    _selectResult(result, options, noScroll) {
        var _a, _b;
        const terminal = this._terminal;
        this.clearActiveDecoration();
        if (!result) {
            terminal.clearSelection();
            return false;
        }
        terminal.select(result.col, result.row, result.size);
        if (options) {
            const marker = terminal.registerMarker(-terminal.buffer.active.baseY - terminal.buffer.active.cursorY + result.row);
            if (marker) {
                this._selectedDecoration = terminal.registerDecoration({
                    marker,
                    x: result.col,
                    width: result.size,
                    backgroundColor: options.activeMatchBackground,
                    layer: 'top',
                    overviewRulerOptions: {
                        color: options.activeMatchColorOverviewRuler
                    }
                });
                (_a = this._selectedDecoration) === null || _a === void 0 ? void 0 : _a.onRender((e) => this._applyStyles(e, options.activeMatchBorder, true));
                (_b = this._selectedDecoration) === null || _b === void 0 ? void 0 : _b.onDispose(() => marker.dispose());
            }
        }
        if (!noScroll) {
            if (result.row >= (terminal.buffer.active.viewportY + terminal.rows) || result.row < terminal.buffer.active.viewportY) {
                let scroll = result.row - terminal.buffer.active.viewportY;
                scroll -= Math.floor(terminal.rows / 2);
                terminal.scrollLines(scroll);
            }
        }
        return true;
    }
    _applyStyles(element, borderColor, isActiveResult) {
        if (element.clientWidth <= 0) {
            return;
        }
        if (!element.classList.contains('xterm-find-result-decoration')) {
            element.classList.add('xterm-find-result-decoration');
            if (borderColor) {
                element.style.outline = `1px solid ${borderColor}`;
            }
        }
        if (isActiveResult) {
            element.classList.add('xterm-find-active-result-decoration');
        }
    }
    _createResultDecoration(result, options) {
        var _a;
        const terminal = this._terminal;
        const marker = terminal.registerMarker(-terminal.buffer.active.baseY - terminal.buffer.active.cursorY + result.row);
        if (!marker) {
            return undefined;
        }
        const findResultDecoration = terminal.registerDecoration({
            marker,
            x: result.col,
            width: result.size,
            backgroundColor: options.matchBackground,
            overviewRulerOptions: ((_a = this._resultDecorations) === null || _a === void 0 ? void 0 : _a.get(marker.line)) ? undefined : {
                color: options.matchOverviewRuler,
                position: 'center'
            }
        });
        findResultDecoration === null || findResultDecoration === void 0 ? void 0 : findResultDecoration.onRender((e) => this._applyStyles(e, options.matchBorder, false));
        findResultDecoration === null || findResultDecoration === void 0 ? void 0 : findResultDecoration.onDispose(() => marker.dispose());
        return findResultDecoration;
    }
}
exports.SearchAddon = SearchAddon;
//# sourceMappingURL=SearchAddon.js.map