"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeElementFromParent = void 0;
function removeElementFromParent(...elements) {
    var _a;
    for (const e of elements) {
        (_a = e === null || e === void 0 ? void 0 : e.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(e);
    }
}
exports.removeElementFromParent = removeElementFromParent;
//# sourceMappingURL=Dom.js.map