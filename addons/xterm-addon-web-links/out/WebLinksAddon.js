"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebLinksAddon = void 0;
const WebLinkProvider_1 = require("./WebLinkProvider");
const protocolClause = '(https?:\\/\\/)';
const domainCharacterSet = '[\\da-z\\.-]+';
const negatedDomainCharacterSet = '[^\\da-z\\.-]+';
const domainBodyClause = '(' + domainCharacterSet + ')';
const tldClause = '([a-z\\.]{2,18})';
const ipClause = '((\\d{1,3}\\.){3}\\d{1,3})';
const localHostClause = '(localhost)';
const portClause = '(:\\d{1,5})';
const hostClause = '((' + domainBodyClause + '\\.' + tldClause + ')|' + ipClause + '|' + localHostClause + ')' + portClause + '?';
const pathCharacterSet = '(\\/[\\/\\w\\.\\-%~:+@]*)*([^:"\'\\s])';
const pathClause = '(' + pathCharacterSet + ')?';
const queryStringHashFragmentCharacterSet = '[0-9\\w\\[\\]\\(\\)\\/\\?\\!#@$%&\'*+,:;~\\=\\.\\-]*';
const queryStringClause = '(\\?' + queryStringHashFragmentCharacterSet + ')?';
const hashFragmentClause = '(#' + queryStringHashFragmentCharacterSet + ')?';
const negatedPathCharacterSet = '[^\\/\\w\\.\\-%]+';
const bodyClause = hostClause + pathClause + queryStringClause + hashFragmentClause;
const start = '(?:^|' + negatedDomainCharacterSet + ')(';
const end = ')($|' + negatedPathCharacterSet + ')';
const strictUrlRegex = new RegExp(start + protocolClause + bodyClause + end);
function handleLink(event, uri) {
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
class WebLinksAddon {
    constructor(_handler = handleLink, _options = {}) {
        this._handler = _handler;
        this._options = _options;
    }
    activate(terminal) {
        this._terminal = terminal;
        const options = this._options;
        const regex = options.urlRegex || strictUrlRegex;
        this._linkProvider = this._terminal.registerLinkProvider(new WebLinkProvider_1.WebLinkProvider(this._terminal, regex, this._handler, options));
    }
    dispose() {
        var _a;
        (_a = this._linkProvider) === null || _a === void 0 ? void 0 : _a.dispose();
    }
}
exports.WebLinksAddon = WebLinksAddon;
//# sourceMappingURL=WebLinksAddon.js.map