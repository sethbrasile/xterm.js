"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Lifecycle_1 = require("common/Lifecycle");
class TestDisposable extends Lifecycle_1.Disposable {
    get isDisposed() {
        return this._isDisposed;
    }
}
describe('Disposable', () => {
    describe('register', () => {
        it('should register disposables', () => {
            const d = new TestDisposable();
            const d2 = {
                dispose: () => { throw new Error(); }
            };
            d.register(d2);
            chai_1.assert.throws(() => d.dispose());
        });
    });
    describe('unregister', () => {
        it('should unregister disposables', () => {
            const d = new TestDisposable();
            const d2 = {
                dispose: () => { throw new Error(); }
            };
            d.register(d2);
            d.unregister(d2);
            chai_1.assert.doesNotThrow(() => d.dispose());
        });
    });
    describe('dispose', () => {
        it('should set is disposed flag', () => {
            const d = new TestDisposable();
            chai_1.assert.isFalse(d.isDisposed);
            d.dispose();
            chai_1.assert.isTrue(d.isDisposed);
        });
    });
});
//# sourceMappingURL=Lifecycle.test.js.map