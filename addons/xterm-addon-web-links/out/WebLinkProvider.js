"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkComputer = exports.WebLinkProvider = void 0;
class WebLinkProvider {
    constructor(_terminal, _regex, _handler, _options = {}) {
        this._terminal = _terminal;
        this._regex = _regex;
        this._handler = _handler;
        this._options = _options;
    }
    provideLinks(y, callback) {
        const links = LinkComputer.computeLink(y, this._regex, this._terminal, this._handler);
        callback(this._addCallbacks(links));
    }
    _addCallbacks(links) {
        return links.map(link => {
            link.leave = this._options.leave;
            link.hover = (event, uri) => {
                if (this._options.hover) {
                    const { range } = link;
                    this._options.hover(event, uri, range);
                }
            };
            return link;
        });
    }
}
exports.WebLinkProvider = WebLinkProvider;
class LinkComputer {
    static computeLink(y, regex, terminal, activate) {
        const rex = new RegExp(regex.source, (regex.flags || '') + 'g');
        const [line, startLineIndex] = LinkComputer._translateBufferLineToStringWithWrap(y - 1, false, terminal);
        let match;
        let stringIndex = -1;
        const result = [];
        while ((match = rex.exec(line)) !== null) {
            const text = match[1];
            if (!text) {
                console.log('match found without corresponding matchIndex');
                break;
            }
            stringIndex = line.indexOf(text, stringIndex + 1);
            rex.lastIndex = stringIndex + text.length;
            if (stringIndex < 0) {
                break;
            }
            let endX = stringIndex + text.length;
            let endY = startLineIndex + 1;
            while (endX > terminal.cols) {
                endX -= terminal.cols;
                endY++;
            }
            let startX = stringIndex + 1;
            let startY = startLineIndex + 1;
            while (startX > terminal.cols) {
                startX -= terminal.cols;
                startY++;
            }
            const range = {
                start: {
                    x: startX,
                    y: startY
                },
                end: {
                    x: endX,
                    y: endY
                }
            };
            result.push({ range, text, activate });
        }
        return result;
    }
    static _translateBufferLineToStringWithWrap(lineIndex, trimRight, terminal) {
        let lineString = '';
        let lineWrapsToNext;
        let prevLinesToWrap;
        do {
            const line = terminal.buffer.active.getLine(lineIndex);
            if (!line) {
                break;
            }
            if (line.isWrapped) {
                lineIndex--;
            }
            prevLinesToWrap = line.isWrapped;
        } while (prevLinesToWrap);
        const startLineIndex = lineIndex;
        do {
            const nextLine = terminal.buffer.active.getLine(lineIndex + 1);
            lineWrapsToNext = nextLine ? nextLine.isWrapped : false;
            const line = terminal.buffer.active.getLine(lineIndex);
            if (!line) {
                break;
            }
            lineString += line.translateToString(!lineWrapsToNext && trimRight).substring(0, terminal.cols);
            lineIndex++;
        } while (lineWrapsToNext);
        return [lineString, startLineIndex];
    }
}
exports.LinkComputer = LinkComputer;
//# sourceMappingURL=WebLinkProvider.js.map