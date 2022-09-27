"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LRUMap = void 0;
class LRUMap {
    constructor(capacity) {
        this.capacity = capacity;
        this._map = {};
        this._head = null;
        this._tail = null;
        this._nodePool = [];
        this.size = 0;
    }
    _unlinkNode(node) {
        const prev = node.prev;
        const next = node.next;
        if (node === this._head) {
            this._head = next;
        }
        if (node === this._tail) {
            this._tail = prev;
        }
        if (prev !== null) {
            prev.next = next;
        }
        if (next !== null) {
            next.prev = prev;
        }
    }
    _appendNode(node) {
        const tail = this._tail;
        if (tail !== null) {
            tail.next = node;
        }
        node.prev = tail;
        node.next = null;
        this._tail = node;
        if (this._head === null) {
            this._head = node;
        }
    }
    prealloc(count) {
        const nodePool = this._nodePool;
        for (let i = 0; i < count; i++) {
            nodePool.push({
                prev: null,
                next: null,
                key: null,
                value: null
            });
        }
    }
    get(key) {
        const node = this._map[key];
        if (node !== undefined) {
            this._unlinkNode(node);
            this._appendNode(node);
            return node.value;
        }
        return null;
    }
    peekValue(key) {
        const node = this._map[key];
        if (node !== undefined) {
            return node.value;
        }
        return null;
    }
    peek() {
        const head = this._head;
        return head === null ? null : head.value;
    }
    set(key, value) {
        let node = this._map[key];
        if (node !== undefined) {
            node = this._map[key];
            this._unlinkNode(node);
            node.value = value;
        }
        else if (this.size >= this.capacity) {
            node = this._head;
            this._unlinkNode(node);
            delete this._map[node.key];
            node.key = key;
            node.value = value;
            this._map[key] = node;
        }
        else {
            const nodePool = this._nodePool;
            if (nodePool.length > 0) {
                node = nodePool.pop();
                node.key = key;
                node.value = value;
            }
            else {
                node = {
                    prev: null,
                    next: null,
                    key,
                    value
                };
            }
            this._map[key] = node;
            this.size++;
        }
        this._appendNode(node);
    }
}
exports.LRUMap = LRUMap;
//# sourceMappingURL=LRUMap.js.map