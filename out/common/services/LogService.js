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
exports.LogService = void 0;
const Services_1 = require("common/services/Services");
const optionsKeyToLogLevel = {
    debug: Services_1.LogLevelEnum.DEBUG,
    info: Services_1.LogLevelEnum.INFO,
    warn: Services_1.LogLevelEnum.WARN,
    error: Services_1.LogLevelEnum.ERROR,
    off: Services_1.LogLevelEnum.OFF
};
const LOG_PREFIX = 'xterm.js: ';
let LogService = class LogService {
    constructor(_optionsService) {
        this._optionsService = _optionsService;
        this.logLevel = Services_1.LogLevelEnum.OFF;
        this._updateLogLevel();
        this._optionsService.onOptionChange(key => {
            if (key === 'logLevel') {
                this._updateLogLevel();
            }
        });
    }
    _updateLogLevel() {
        this.logLevel = optionsKeyToLogLevel[this._optionsService.rawOptions.logLevel];
    }
    _evalLazyOptionalParams(optionalParams) {
        for (let i = 0; i < optionalParams.length; i++) {
            if (typeof optionalParams[i] === 'function') {
                optionalParams[i] = optionalParams[i]();
            }
        }
    }
    _log(type, message, optionalParams) {
        this._evalLazyOptionalParams(optionalParams);
        type.call(console, LOG_PREFIX + message, ...optionalParams);
    }
    debug(message, ...optionalParams) {
        if (this.logLevel <= Services_1.LogLevelEnum.DEBUG) {
            this._log(console.log, message, optionalParams);
        }
    }
    info(message, ...optionalParams) {
        if (this.logLevel <= Services_1.LogLevelEnum.INFO) {
            this._log(console.info, message, optionalParams);
        }
    }
    warn(message, ...optionalParams) {
        if (this.logLevel <= Services_1.LogLevelEnum.WARN) {
            this._log(console.warn, message, optionalParams);
        }
    }
    error(message, ...optionalParams) {
        if (this.logLevel <= Services_1.LogLevelEnum.ERROR) {
            this._log(console.error, message, optionalParams);
        }
    }
};
LogService = __decorate([
    __param(0, Services_1.IOptionsService)
], LogService);
exports.LogService = LogService;
//# sourceMappingURL=LogService.js.map