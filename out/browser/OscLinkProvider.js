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
exports.OscLinkProvider = void 0;
const CellData_1 = require("common/buffer/CellData");
const Services_1 = require("common/services/Services");
let OscLinkProvider = class OscLinkProvider {
    constructor(_bufferService, _optionsService, _oscLinkService) {
        this._bufferService = _bufferService;
        this._optionsService = _optionsService;
        this._oscLinkService = _oscLinkService;
    }
    provideLinks(y, callback) {
        var _a;
        const line = this._bufferService.buffer.lines.get(y - 1);
        if (!line) {
            callback(undefined);
            return;
        }
        const result = [];
        const linkHandler = this._optionsService.rawOptions.linkHandler;
        const cell = new CellData_1.CellData();
        const lineLength = line.getTrimmedLength();
        let currentLinkId = -1;
        let currentStart = -1;
        let finishLink = false;
        for (let x = 0; x < lineLength; x++) {
            if (currentStart === -1 && !line.hasContent(x)) {
                continue;
            }
            line.loadCell(x, cell);
            if (cell.hasExtendedAttrs() && cell.extended.urlId) {
                if (currentStart === -1) {
                    currentStart = x;
                    currentLinkId = cell.extended.urlId;
                    continue;
                }
                else {
                    finishLink = cell.extended.urlId !== currentLinkId;
                }
            }
            else {
                if (currentStart !== -1) {
                    finishLink = true;
                }
            }
            if (finishLink || (currentStart !== -1 && x === lineLength - 1)) {
                const text = (_a = this._oscLinkService.getLinkData(currentLinkId)) === null || _a === void 0 ? void 0 : _a.uri;
                if (text) {
                    const range = {
                        start: {
                            x: currentStart + 1,
                            y
                        },
                        end: {
                            x: x + (!finishLink && x === lineLength - 1 ? 1 : 0),
                            y
                        }
                    };
                    result.push({
                        text,
                        range,
                        activate: (e, text) => (linkHandler ? linkHandler.activate(e, text, range) : defaultActivate(e, text)),
                        hover: (e, text) => { var _a; return (_a = linkHandler === null || linkHandler === void 0 ? void 0 : linkHandler.hover) === null || _a === void 0 ? void 0 : _a.call(linkHandler, e, text, range); },
                        leave: (e, text) => { var _a; return (_a = linkHandler === null || linkHandler === void 0 ? void 0 : linkHandler.leave) === null || _a === void 0 ? void 0 : _a.call(linkHandler, e, text, range); }
                    });
                }
                finishLink = false;
                if (cell.hasExtendedAttrs() && cell.extended.urlId) {
                    currentStart = x;
                    currentLinkId = cell.extended.urlId;
                }
                else {
                    currentStart = -1;
                    currentLinkId = -1;
                }
            }
        }
        callback(result);
    }
};
OscLinkProvider = __decorate([
    __param(0, Services_1.IBufferService),
    __param(1, Services_1.IOptionsService),
    __param(2, Services_1.IOscLinkService)
], OscLinkProvider);
exports.OscLinkProvider = OscLinkProvider;
function defaultActivate(e, uri) {
    const answer = confirm(`Do you want to navigate to ${uri}?`);
    if (answer) {
        const newWindow = window.open();
        if (newWindow) {
            try {
                newWindow.opener = null;
            }
            catch (_a) {
            }
            newWindow.location.href = uri;
        }
        else {
            console.warn('Opening link blocked as opener could not be cleared');
        }
    }
}
//# sourceMappingURL=OscLinkProvider.js.map