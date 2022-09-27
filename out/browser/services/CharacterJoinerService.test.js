"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const CharacterJoinerService_1 = require("browser/services/CharacterJoinerService");
const BufferLine_1 = require("common/buffer/BufferLine");
const CellData_1 = require("common/buffer/CellData");
const TestUtils_test_1 = require("common/TestUtils.test");
describe('CharacterJoinerService', () => {
    let service;
    beforeEach(() => {
        const bufferService = new TestUtils_test_1.MockBufferService(16, 10);
        const lines = bufferService.buffer.lines;
        lines.set(0, lineData([['a -> b -> c -> d']]));
        lines.set(1, lineData([['a -> b => c -> d']]));
        lines.set(2, lineData([['a -> b -', 0xFFFFFFFF], ['> c -> d', 0]]));
        lines.set(3, lineData([['no joined ranges']]));
        lines.set(4, new BufferLine_1.BufferLine(0));
        lines.set(5, lineData([['a', 0x11111111], [' -> b -> c -> '], ['d', 0x22222222]]));
        const line6 = lineData([['wi']]);
        line6.resize(line6.length + 1, CellData_1.CellData.fromCharData([0, '￥', 2, '￥'.charCodeAt(0)]));
        line6.resize(line6.length + 1, CellData_1.CellData.fromCharData([0, '', 0, 0]));
        let sub = lineData([['deemo']]);
        let oldSize = line6.length;
        line6.resize(oldSize + sub.length, CellData_1.CellData.fromCharData([0, '', 0, 0]));
        for (let i = 0; i < sub.length; ++i)
            line6.setCell(i + oldSize, sub.loadCell(i, new CellData_1.CellData()));
        line6.resize(line6.length + 1, CellData_1.CellData.fromCharData([0, '\xf0\x9f\x98\x81', 1, 128513]));
        line6.resize(line6.length + 1, CellData_1.CellData.fromCharData([0, ' ', 1, ' '.charCodeAt(0)]));
        sub = lineData([['jiabc']]);
        oldSize = line6.length;
        line6.resize(oldSize + sub.length, CellData_1.CellData.fromCharData([0, '', 0, 0]));
        for (let i = 0; i < sub.length; ++i)
            line6.setCell(i + oldSize, sub.loadCell(i, new CellData_1.CellData()));
        lines.set(6, line6);
        service = new CharacterJoinerService_1.CharacterJoinerService(bufferService);
    });
    it('has no joiners upon creation', () => {
        chai_1.assert.deepEqual(service.getJoinedCharacters(0), []);
    });
    it('returns ranges matched by the registered joiners', () => {
        service.register(substringJoiner('->'));
        chai_1.assert.deepEqual(service.getJoinedCharacters(0), [[2, 4], [7, 9], [12, 14]]);
    });
    it('processes the input using all provided joiners', () => {
        service.register(substringJoiner('->'));
        chai_1.assert.deepEqual(service.getJoinedCharacters(1), [[2, 4], [12, 14]]);
        service.register(substringJoiner('=>'));
        chai_1.assert.deepEqual(service.getJoinedCharacters(1), [[2, 4], [7, 9], [12, 14]]);
    });
    it('removes deregistered joiners from future calls', () => {
        const joiner1 = service.register(substringJoiner('->'));
        const joiner2 = service.register(substringJoiner('=>'));
        chai_1.assert.deepEqual(service.getJoinedCharacters(1), [[2, 4], [7, 9], [12, 14]]);
        service.deregister(joiner1);
        chai_1.assert.deepEqual(service.getJoinedCharacters(1), [[7, 9]]);
        service.deregister(joiner2);
        chai_1.assert.deepEqual(service.getJoinedCharacters(1), []);
    });
    it('doesn\'t process joins on differently-styled characters', () => {
        service.register(substringJoiner('->'));
        chai_1.assert.deepEqual(service.getJoinedCharacters(2), [[2, 4], [12, 14]]);
    });
    it('returns an empty list of ranges if there is nothing to be joined', () => {
        service.register(substringJoiner('->'));
        chai_1.assert.deepEqual(service.getJoinedCharacters(3), []);
    });
    it('returns an empty list of ranges if the line is empty', () => {
        service.register(substringJoiner('->'));
        chai_1.assert.deepEqual(service.getJoinedCharacters(4), []);
    });
    it('returns false when trying to deregister a joiner that does not exist', () => {
        service.register(substringJoiner('->'));
        chai_1.assert.deepEqual(service.deregister(123), false);
        chai_1.assert.deepEqual(service.getJoinedCharacters(0), [[2, 4], [7, 9], [12, 14]]);
    });
    it('doesn\'t process same-styled ranges that only have one character', () => {
        service.register(substringJoiner('a'));
        service.register(substringJoiner('b'));
        service.register(substringJoiner('d'));
        chai_1.assert.deepEqual(service.getJoinedCharacters(5), [[5, 6]]);
    });
    it('handles ranges that extend all the way to the end of the line', () => {
        service.register(substringJoiner('-> d'));
        chai_1.assert.deepEqual(service.getJoinedCharacters(2), [[12, 16]]);
    });
    it('handles adjacent ranges', () => {
        service.register(substringJoiner('->'));
        service.register(substringJoiner('> c '));
        chai_1.assert.deepEqual(service.getJoinedCharacters(2), [[2, 4], [8, 12], [12, 14]]);
    });
    it('handles fullwidth characters in the middle of ranges', () => {
        service.register(substringJoiner('wi￥de'));
        chai_1.assert.deepEqual(service.getJoinedCharacters(6), [[0, 6]]);
    });
    it('handles fullwidth characters at the end of ranges', () => {
        service.register(substringJoiner('wi￥'));
        chai_1.assert.deepEqual(service.getJoinedCharacters(6), [[0, 4]]);
    });
    it('handles emojis in the middle of ranges', () => {
        service.register(substringJoiner('emo\xf0\x9f\x98\x81 ji'));
        chai_1.assert.deepEqual(service.getJoinedCharacters(6), [[6, 13]]);
    });
    it('handles emojis at the end of ranges', () => {
        service.register(substringJoiner('emo\xf0\x9f\x98\x81 '));
        chai_1.assert.deepEqual(service.getJoinedCharacters(6), [[6, 11]]);
    });
    it('handles ranges after wide and emoji characters', () => {
        service.register(substringJoiner('abc'));
        chai_1.assert.deepEqual(service.getJoinedCharacters(6), [[13, 16]]);
    });
    describe('range merging', () => {
        it('inserts a new range before the existing ones', () => {
            service.register(() => [[1, 2], [2, 3]]);
            service.register(() => [[0, 1]]);
            chai_1.assert.deepEqual(service.getJoinedCharacters(0), [[0, 1], [1, 2], [2, 3]]);
        });
        it('inserts in between two ranges', () => {
            service.register(() => [[0, 2], [4, 6]]);
            service.register(() => [[2, 4]]);
            chai_1.assert.deepEqual(service.getJoinedCharacters(0), [[0, 2], [2, 4], [4, 6]]);
        });
        it('inserts after the last range', () => {
            service.register(() => [[0, 2], [4, 6]]);
            service.register(() => [[6, 8]]);
            chai_1.assert.deepEqual(service.getJoinedCharacters(0), [[0, 2], [4, 6], [6, 8]]);
        });
        it('extends the beginning of a range', () => {
            service.register(() => [[0, 2], [4, 6]]);
            service.register(() => [[3, 5]]);
            chai_1.assert.deepEqual(service.getJoinedCharacters(0), [[0, 2], [3, 6]]);
        });
        it('extends the end of a range', () => {
            service.register(() => [[0, 2], [4, 6]]);
            service.register(() => [[1, 4]]);
            chai_1.assert.deepEqual(service.getJoinedCharacters(0), [[0, 4], [4, 6]]);
        });
        it('extends the last range', () => {
            service.register(() => [[0, 2], [4, 6]]);
            service.register(() => [[5, 7]]);
            chai_1.assert.deepEqual(service.getJoinedCharacters(0), [[0, 2], [4, 7]]);
        });
        it('connects two ranges', () => {
            service.register(() => [[0, 2], [4, 6]]);
            service.register(() => [[1, 5]]);
            chai_1.assert.deepEqual(service.getJoinedCharacters(0), [[0, 6]]);
        });
        it('connects more than two ranges', () => {
            service.register(() => [[0, 2], [4, 6], [8, 10], [12, 14]]);
            service.register(() => [[1, 10]]);
            chai_1.assert.deepEqual(service.getJoinedCharacters(0), [[0, 10], [12, 14]]);
        });
    });
});
function lineData(data) {
    const tline = new BufferLine_1.BufferLine(0);
    for (let i = 0; i < data.length; ++i) {
        const line = data[i][0];
        const attr = (data[i][1] || 0);
        const offset = tline.length;
        tline.resize(tline.length + line.split('').length, CellData_1.CellData.fromCharData([0, '', 0, 0]));
        line.split('').map((char, idx) => tline.setCell(idx + offset, CellData_1.CellData.fromCharData([attr, char, 1, char.charCodeAt(0)])));
    }
    return tline;
}
function substringJoiner(substring) {
    return (sequence) => {
        const ranges = [];
        let searchIndex = 0;
        let matchIndex = -1;
        while ((matchIndex = sequence.indexOf(substring, searchIndex)) !== -1) {
            const matchEndIndex = matchIndex + substring.length;
            searchIndex = matchEndIndex;
            ranges.push([matchIndex, matchEndIndex]);
        }
        return ranges;
    };
}
//# sourceMappingURL=CharacterJoinerService.test.js.map