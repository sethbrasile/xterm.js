"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICharacterJoinerService = exports.ISelectionService = exports.IRenderService = exports.IMouseService = exports.ICoreBrowserService = exports.ICharSizeService = void 0;
const ServiceRegistry_1 = require("common/services/ServiceRegistry");
exports.ICharSizeService = (0, ServiceRegistry_1.createDecorator)('CharSizeService');
exports.ICoreBrowserService = (0, ServiceRegistry_1.createDecorator)('CoreBrowserService');
exports.IMouseService = (0, ServiceRegistry_1.createDecorator)('MouseService');
exports.IRenderService = (0, ServiceRegistry_1.createDecorator)('RenderService');
exports.ISelectionService = (0, ServiceRegistry_1.createDecorator)('SelectionService');
exports.ICharacterJoinerService = (0, ServiceRegistry_1.createDecorator)('CharacterJoinerService');
//# sourceMappingURL=Services.js.map