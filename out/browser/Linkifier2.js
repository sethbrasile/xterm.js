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
exports.Linkifier2 = void 0;
const Services_1 = require("common/services/Services");
const EventEmitter_1 = require("common/EventEmitter");
const Lifecycle_1 = require("common/Lifecycle");
const Lifecycle_2 = require("browser/Lifecycle");
let Linkifier2 = class Linkifier2 extends Lifecycle_1.Disposable {
    constructor(_bufferService) {
        super();
        this._bufferService = _bufferService;
        this._linkProviders = [];
        this._linkCacheDisposables = [];
        this._isMouseOut = true;
        this._activeLine = -1;
        this._onShowLinkUnderline = this.register(new EventEmitter_1.EventEmitter());
        this._onHideLinkUnderline = this.register(new EventEmitter_1.EventEmitter());
        this.register((0, Lifecycle_1.getDisposeArrayDisposable)(this._linkCacheDisposables));
    }
    get currentLink() { return this._currentLink; }
    get onShowLinkUnderline() { return this._onShowLinkUnderline.event; }
    get onHideLinkUnderline() { return this._onHideLinkUnderline.event; }
    dispose() {
        super.dispose();
        this._lastMouseEvent = undefined;
    }
    registerLinkProvider(linkProvider) {
        this._linkProviders.push(linkProvider);
        return {
            dispose: () => {
                const providerIndex = this._linkProviders.indexOf(linkProvider);
                if (providerIndex !== -1) {
                    this._linkProviders.splice(providerIndex, 1);
                }
            }
        };
    }
    attachToDom(element, mouseService, renderService) {
        this._element = element;
        this._mouseService = mouseService;
        this._renderService = renderService;
        this.register((0, Lifecycle_2.addDisposableDomListener)(this._element, 'mouseleave', () => {
            this._isMouseOut = true;
            this._clearCurrentLink();
        }));
        this.register((0, Lifecycle_2.addDisposableDomListener)(this._element, 'mousemove', this._onMouseMove.bind(this)));
        this.register((0, Lifecycle_2.addDisposableDomListener)(this._element, 'mousedown', this._handleMouseDown.bind(this)));
        this.register((0, Lifecycle_2.addDisposableDomListener)(this._element, 'mouseup', this._handleMouseUp.bind(this)));
    }
    _onMouseMove(event) {
        this._lastMouseEvent = event;
        if (!this._element || !this._mouseService) {
            return;
        }
        const position = this._positionFromMouseEvent(event, this._element, this._mouseService);
        if (!position) {
            return;
        }
        this._isMouseOut = false;
        const composedPath = event.composedPath();
        for (let i = 0; i < composedPath.length; i++) {
            const target = composedPath[i];
            if (target.classList.contains('xterm')) {
                break;
            }
            if (target.classList.contains('xterm-hover')) {
                return;
            }
        }
        if (!this._lastBufferCell || (position.x !== this._lastBufferCell.x || position.y !== this._lastBufferCell.y)) {
            this._onHover(position);
            this._lastBufferCell = position;
        }
    }
    _onHover(position) {
        if (this._activeLine !== position.y) {
            this._clearCurrentLink();
            this._askForLink(position, false);
            return;
        }
        const isCurrentLinkInPosition = this._currentLink && this._linkAtPosition(this._currentLink.link, position);
        if (!isCurrentLinkInPosition) {
            this._clearCurrentLink();
            this._askForLink(position, true);
        }
    }
    _askForLink(position, useLineCache) {
        var _a, _b;
        if (!this._activeProviderReplies || !useLineCache) {
            (_a = this._activeProviderReplies) === null || _a === void 0 ? void 0 : _a.forEach(reply => {
                reply === null || reply === void 0 ? void 0 : reply.forEach(linkWithState => {
                    if (linkWithState.link.dispose) {
                        linkWithState.link.dispose();
                    }
                });
            });
            this._activeProviderReplies = new Map();
            this._activeLine = position.y;
        }
        let linkProvided = false;
        for (const [i, linkProvider] of this._linkProviders.entries()) {
            if (useLineCache) {
                const existingReply = (_b = this._activeProviderReplies) === null || _b === void 0 ? void 0 : _b.get(i);
                if (existingReply) {
                    linkProvided = this._checkLinkProviderResult(i, position, linkProvided);
                }
            }
            else {
                linkProvider.provideLinks(position.y, (links) => {
                    var _a, _b;
                    if (this._isMouseOut) {
                        return;
                    }
                    const linksWithState = links === null || links === void 0 ? void 0 : links.map(link => ({ link }));
                    (_a = this._activeProviderReplies) === null || _a === void 0 ? void 0 : _a.set(i, linksWithState);
                    linkProvided = this._checkLinkProviderResult(i, position, linkProvided);
                    if (((_b = this._activeProviderReplies) === null || _b === void 0 ? void 0 : _b.size) === this._linkProviders.length) {
                        this._removeIntersectingLinks(position.y, this._activeProviderReplies);
                    }
                });
            }
        }
    }
    _removeIntersectingLinks(y, replies) {
        const occupiedCells = new Set();
        for (let i = 0; i < replies.size; i++) {
            const providerReply = replies.get(i);
            if (!providerReply) {
                continue;
            }
            for (let i = 0; i < providerReply.length; i++) {
                const linkWithState = providerReply[i];
                const startX = linkWithState.link.range.start.y < y ? 0 : linkWithState.link.range.start.x;
                const endX = linkWithState.link.range.end.y > y ? this._bufferService.cols : linkWithState.link.range.end.x;
                for (let x = startX; x <= endX; x++) {
                    if (occupiedCells.has(x)) {
                        providerReply.splice(i--, 1);
                        break;
                    }
                    occupiedCells.add(x);
                }
            }
        }
    }
    _checkLinkProviderResult(index, position, linkProvided) {
        var _a;
        if (!this._activeProviderReplies) {
            return linkProvided;
        }
        const links = this._activeProviderReplies.get(index);
        let hasLinkBefore = false;
        for (let j = 0; j < index; j++) {
            if (!this._activeProviderReplies.has(j) || this._activeProviderReplies.get(j)) {
                hasLinkBefore = true;
            }
        }
        if (!hasLinkBefore && links) {
            const linkAtPosition = links.find(link => this._linkAtPosition(link.link, position));
            if (linkAtPosition) {
                linkProvided = true;
                this._handleNewLink(linkAtPosition);
            }
        }
        if (this._activeProviderReplies.size === this._linkProviders.length && !linkProvided) {
            for (let j = 0; j < this._activeProviderReplies.size; j++) {
                const currentLink = (_a = this._activeProviderReplies.get(j)) === null || _a === void 0 ? void 0 : _a.find(link => this._linkAtPosition(link.link, position));
                if (currentLink) {
                    linkProvided = true;
                    this._handleNewLink(currentLink);
                    break;
                }
            }
        }
        return linkProvided;
    }
    _handleMouseDown() {
        this._mouseDownLink = this._currentLink;
    }
    _handleMouseUp(event) {
        if (!this._element || !this._mouseService || !this._currentLink) {
            return;
        }
        const position = this._positionFromMouseEvent(event, this._element, this._mouseService);
        if (!position) {
            return;
        }
        if (this._mouseDownLink === this._currentLink && this._linkAtPosition(this._currentLink.link, position)) {
            this._currentLink.link.activate(event, this._currentLink.link.text);
        }
    }
    _clearCurrentLink(startRow, endRow) {
        if (!this._element || !this._currentLink || !this._lastMouseEvent) {
            return;
        }
        if (!startRow || !endRow || (this._currentLink.link.range.start.y >= startRow && this._currentLink.link.range.end.y <= endRow)) {
            this._linkLeave(this._element, this._currentLink.link, this._lastMouseEvent);
            this._currentLink = undefined;
            (0, Lifecycle_1.disposeArray)(this._linkCacheDisposables);
        }
    }
    _handleNewLink(linkWithState) {
        if (!this._element || !this._lastMouseEvent || !this._mouseService) {
            return;
        }
        const position = this._positionFromMouseEvent(this._lastMouseEvent, this._element, this._mouseService);
        if (!position) {
            return;
        }
        if (this._linkAtPosition(linkWithState.link, position)) {
            this._currentLink = linkWithState;
            this._currentLink.state = {
                decorations: {
                    underline: linkWithState.link.decorations === undefined ? true : linkWithState.link.decorations.underline,
                    pointerCursor: linkWithState.link.decorations === undefined ? true : linkWithState.link.decorations.pointerCursor
                },
                isHovered: true
            };
            this._linkHover(this._element, linkWithState.link, this._lastMouseEvent);
            linkWithState.link.decorations = {};
            Object.defineProperties(linkWithState.link.decorations, {
                pointerCursor: {
                    get: () => { var _a, _b; return (_b = (_a = this._currentLink) === null || _a === void 0 ? void 0 : _a.state) === null || _b === void 0 ? void 0 : _b.decorations.pointerCursor; },
                    set: v => {
                        var _a, _b;
                        if (((_a = this._currentLink) === null || _a === void 0 ? void 0 : _a.state) && this._currentLink.state.decorations.pointerCursor !== v) {
                            this._currentLink.state.decorations.pointerCursor = v;
                            if (this._currentLink.state.isHovered) {
                                (_b = this._element) === null || _b === void 0 ? void 0 : _b.classList.toggle('xterm-cursor-pointer', v);
                            }
                        }
                    }
                },
                underline: {
                    get: () => { var _a, _b; return (_b = (_a = this._currentLink) === null || _a === void 0 ? void 0 : _a.state) === null || _b === void 0 ? void 0 : _b.decorations.underline; },
                    set: v => {
                        var _a, _b, _c;
                        if (((_a = this._currentLink) === null || _a === void 0 ? void 0 : _a.state) && ((_c = (_b = this._currentLink) === null || _b === void 0 ? void 0 : _b.state) === null || _c === void 0 ? void 0 : _c.decorations.underline) !== v) {
                            this._currentLink.state.decorations.underline = v;
                            if (this._currentLink.state.isHovered) {
                                this._fireUnderlineEvent(linkWithState.link, v);
                            }
                        }
                    }
                }
            });
            if (this._renderService) {
                this._linkCacheDisposables.push(this._renderService.onRenderedViewportChange(e => {
                    const start = e.start === 0 ? 0 : e.start + 1 + this._bufferService.buffer.ydisp;
                    this._clearCurrentLink(start, e.end + 1 + this._bufferService.buffer.ydisp);
                }));
            }
        }
    }
    _linkHover(element, link, event) {
        var _a;
        if ((_a = this._currentLink) === null || _a === void 0 ? void 0 : _a.state) {
            this._currentLink.state.isHovered = true;
            if (this._currentLink.state.decorations.underline) {
                this._fireUnderlineEvent(link, true);
            }
            if (this._currentLink.state.decorations.pointerCursor) {
                element.classList.add('xterm-cursor-pointer');
            }
        }
        if (link.hover) {
            link.hover(event, link.text);
        }
    }
    _fireUnderlineEvent(link, showEvent) {
        const range = link.range;
        const scrollOffset = this._bufferService.buffer.ydisp;
        const event = this._createLinkUnderlineEvent(range.start.x - 1, range.start.y - scrollOffset - 1, range.end.x, range.end.y - scrollOffset - 1, undefined);
        const emitter = showEvent ? this._onShowLinkUnderline : this._onHideLinkUnderline;
        emitter.fire(event);
    }
    _linkLeave(element, link, event) {
        var _a;
        if ((_a = this._currentLink) === null || _a === void 0 ? void 0 : _a.state) {
            this._currentLink.state.isHovered = false;
            if (this._currentLink.state.decorations.underline) {
                this._fireUnderlineEvent(link, false);
            }
            if (this._currentLink.state.decorations.pointerCursor) {
                element.classList.remove('xterm-cursor-pointer');
            }
        }
        if (link.leave) {
            link.leave(event, link.text);
        }
    }
    _linkAtPosition(link, position) {
        const sameLine = link.range.start.y === link.range.end.y;
        const wrappedFromLeft = link.range.start.y < position.y;
        const wrappedToRight = link.range.end.y > position.y;
        return ((sameLine && link.range.start.x <= position.x && link.range.end.x >= position.x) ||
            (wrappedFromLeft && link.range.end.x >= position.x) ||
            (wrappedToRight && link.range.start.x <= position.x) ||
            (wrappedFromLeft && wrappedToRight)) &&
            link.range.start.y <= position.y &&
            link.range.end.y >= position.y;
    }
    _positionFromMouseEvent(event, element, mouseService) {
        const coords = mouseService.getCoords(event, element, this._bufferService.cols, this._bufferService.rows);
        if (!coords) {
            return;
        }
        return { x: coords[0], y: coords[1] + this._bufferService.buffer.ydisp };
    }
    _createLinkUnderlineEvent(x1, y1, x2, y2, fg) {
        return { x1, y1, x2, y2, cols: this._bufferService.cols, fg };
    }
};
Linkifier2 = __decorate([
    __param(0, Services_1.IBufferService)
], Linkifier2);
exports.Linkifier2 = Linkifier2;
//# sourceMappingURL=Linkifier2.js.map