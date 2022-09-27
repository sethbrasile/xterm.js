"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeTerminalFromCache = exports.acquireCharAtlas = void 0;
const CharAtlasUtils_1 = require("./CharAtlasUtils");
const DynamicCharAtlas_1 = require("./DynamicCharAtlas");
const charAtlasCache = [];
function acquireCharAtlas(options, rendererId, colors, scaledCharWidth, scaledCharHeight, devicePixelRatio) {
    const newConfig = (0, CharAtlasUtils_1.generateConfig)(scaledCharWidth, scaledCharHeight, options, colors, devicePixelRatio);
    for (let i = 0; i < charAtlasCache.length; i++) {
        const entry = charAtlasCache[i];
        const ownedByIndex = entry.ownedBy.indexOf(rendererId);
        if (ownedByIndex >= 0) {
            if ((0, CharAtlasUtils_1.configEquals)(entry.config, newConfig)) {
                return entry.atlas;
            }
            if (entry.ownedBy.length === 1) {
                entry.atlas.dispose();
                charAtlasCache.splice(i, 1);
            }
            else {
                entry.ownedBy.splice(ownedByIndex, 1);
            }
            break;
        }
    }
    for (let i = 0; i < charAtlasCache.length; i++) {
        const entry = charAtlasCache[i];
        if ((0, CharAtlasUtils_1.configEquals)(entry.config, newConfig)) {
            entry.ownedBy.push(rendererId);
            return entry.atlas;
        }
    }
    const newEntry = {
        atlas: new DynamicCharAtlas_1.DynamicCharAtlas(document, newConfig),
        config: newConfig,
        ownedBy: [rendererId]
    };
    charAtlasCache.push(newEntry);
    return newEntry.atlas;
}
exports.acquireCharAtlas = acquireCharAtlas;
function removeTerminalFromCache(rendererId) {
    for (let i = 0; i < charAtlasCache.length; i++) {
        const index = charAtlasCache[i].ownedBy.indexOf(rendererId);
        if (index !== -1) {
            if (charAtlasCache[i].ownedBy.length === 1) {
                charAtlasCache[i].atlas.dispose();
                charAtlasCache.splice(i, 1);
            }
            else {
                charAtlasCache[i].ownedBy.splice(index, 1);
            }
            break;
        }
    }
}
exports.removeTerminalFromCache = removeTerminalFromCache;
//# sourceMappingURL=CharAtlasCache.js.map