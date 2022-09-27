"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDecorationService = exports.IUnicodeService = exports.IOscLinkService = exports.IOptionsService = exports.ILogService = exports.LogLevelEnum = exports.IInstantiationService = exports.IDirtyRowService = exports.ICharsetService = exports.ICoreService = exports.ICoreMouseService = exports.IBufferService = void 0;
const ServiceRegistry_1 = require("common/services/ServiceRegistry");
exports.IBufferService = (0, ServiceRegistry_1.createDecorator)('BufferService');
exports.ICoreMouseService = (0, ServiceRegistry_1.createDecorator)('CoreMouseService');
exports.ICoreService = (0, ServiceRegistry_1.createDecorator)('CoreService');
exports.ICharsetService = (0, ServiceRegistry_1.createDecorator)('CharsetService');
exports.IDirtyRowService = (0, ServiceRegistry_1.createDecorator)('DirtyRowService');
exports.IInstantiationService = (0, ServiceRegistry_1.createDecorator)('InstantiationService');
var LogLevelEnum;
(function (LogLevelEnum) {
    LogLevelEnum[LogLevelEnum["DEBUG"] = 0] = "DEBUG";
    LogLevelEnum[LogLevelEnum["INFO"] = 1] = "INFO";
    LogLevelEnum[LogLevelEnum["WARN"] = 2] = "WARN";
    LogLevelEnum[LogLevelEnum["ERROR"] = 3] = "ERROR";
    LogLevelEnum[LogLevelEnum["OFF"] = 4] = "OFF";
})(LogLevelEnum = exports.LogLevelEnum || (exports.LogLevelEnum = {}));
exports.ILogService = (0, ServiceRegistry_1.createDecorator)('LogService');
exports.IOptionsService = (0, ServiceRegistry_1.createDecorator)('OptionsService');
exports.IOscLinkService = (0, ServiceRegistry_1.createDecorator)('OscLinkService');
exports.IUnicodeService = (0, ServiceRegistry_1.createDecorator)('UnicodeService');
exports.IDecorationService = (0, ServiceRegistry_1.createDecorator)('DecorationService');
//# sourceMappingURL=Services.js.map