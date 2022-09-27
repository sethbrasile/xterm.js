"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLinux = exports.isWindows = exports.isIphone = exports.isIpad = exports.isMac = exports.isSafari = exports.isLegacyEdge = exports.isFirefox = void 0;
const isNode = (typeof navigator === 'undefined') ? true : false;
const userAgent = (isNode) ? 'node' : navigator.userAgent;
const platform = (isNode) ? 'node' : navigator.platform;
exports.isFirefox = userAgent.includes('Firefox');
exports.isLegacyEdge = userAgent.includes('Edge');
exports.isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
exports.isMac = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'].includes(platform);
exports.isIpad = platform === 'iPad';
exports.isIphone = platform === 'iPhone';
exports.isWindows = ['Windows', 'Win16', 'Win32', 'WinCE'].includes(platform);
exports.isLinux = platform.indexOf('Linux') >= 0;
//# sourceMappingURL=Platform.js.map