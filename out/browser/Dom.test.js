"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom = require("jsdom");
const Dom_1 = require("browser/Dom");
const assert_1 = require("assert");
describe('Dom', () => {
    const dom = new jsdom.JSDOM();
    const document = dom.window.document;
    describe('removeElementFromParent', () => {
        it('should remove single child', () => {
            const e = document.createElement('div');
            document.body.appendChild(e);
            (0, assert_1.strictEqual)(e.parentElement, document.body);
            (0, Dom_1.removeElementFromParent)(e);
            (0, assert_1.strictEqual)(e.parentElement, null);
        });
        it('should remove multiple elements', () => {
            const e1 = document.createElement('div');
            const e2 = document.createElement('div');
            document.body.appendChild(e1);
            document.body.appendChild(e2);
            (0, assert_1.strictEqual)(e1.parentElement, document.body);
            (0, assert_1.strictEqual)(e2.parentElement, document.body);
            (0, Dom_1.removeElementFromParent)(e1, e2);
            (0, assert_1.strictEqual)(e1.parentElement, null);
            (0, assert_1.strictEqual)(e2.parentElement, null);
        });
        it('should not throw on undefined', () => {
            const e = document.createElement('div');
            document.body.appendChild(e);
            (0, assert_1.strictEqual)(e.parentElement, document.body);
            (0, assert_1.doesNotThrow)(() => (0, Dom_1.removeElementFromParent)(undefined, e));
            (0, assert_1.strictEqual)(e.parentElement, null);
        });
    });
});
//# sourceMappingURL=Dom.test.js.map