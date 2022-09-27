"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom = require("jsdom");
const chai_1 = require("chai");
const DomRendererRowFactory_1 = require("browser/renderer/dom/DomRendererRowFactory");
const Constants_1 = require("common/buffer/Constants");
const BufferLine_1 = require("common/buffer/BufferLine");
const CellData_1 = require("common/buffer/CellData");
const TestUtils_test_1 = require("common/TestUtils.test");
const Color_1 = require("common/Color");
const TestUtils_test_2 = require("browser/TestUtils.test");
describe('DomRendererRowFactory', () => {
    let dom;
    let rowFactory;
    let lineData;
    beforeEach(() => {
        dom = new jsdom.JSDOM('');
        rowFactory = new DomRendererRowFactory_1.DomRendererRowFactory(dom.window.document, {
            background: Color_1.css.toColor('#010101'),
            foreground: Color_1.css.toColor('#020202'),
            ansi: [
                Color_1.css.toColor('#2e3436'),
                Color_1.css.toColor('#cc0000'),
                Color_1.css.toColor('#4e9a06'),
                Color_1.css.toColor('#c4a000'),
                Color_1.css.toColor('#3465a4'),
                Color_1.css.toColor('#75507b'),
                Color_1.css.toColor('#06989a'),
                Color_1.css.toColor('#d3d7cf'),
                Color_1.css.toColor('#555753'),
                Color_1.css.toColor('#ef2929'),
                Color_1.css.toColor('#8ae234'),
                Color_1.css.toColor('#fce94f'),
                Color_1.css.toColor('#729fcf'),
                Color_1.css.toColor('#ad7fa8'),
                Color_1.css.toColor('#34e2e2'),
                Color_1.css.toColor('#eeeeec')
            ]
        }, new TestUtils_test_2.MockCharacterJoinerService(), new TestUtils_test_1.MockOptionsService({ drawBoldTextInBrightColors: true }), new TestUtils_test_2.MockCoreBrowserService(), new TestUtils_test_1.MockCoreService(), new TestUtils_test_1.MockDecorationService());
        lineData = createEmptyLineData(2);
    });
    describe('createRow', () => {
        it('should not create anything for an empty row', () => {
            const fragment = rowFactory.createRow(lineData, 0, false, undefined, 0, false, 5, 20);
            chai_1.assert.equal(getFragmentHtml(fragment), '');
        });
        it('should set correct attributes for double width characters', () => {
            lineData.setCell(0, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, '語', 2, '語'.charCodeAt(0)]));
            lineData.setCell(1, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, '', 0, 0]));
            const fragment = rowFactory.createRow(lineData, 0, false, undefined, 0, false, 5, 20);
            chai_1.assert.equal(getFragmentHtml(fragment), '<span style="width: 10px;">語</span>');
        });
        it('should add class for cursor and cursor style', () => {
            for (const style of ['block', 'bar', 'underline']) {
                const fragment = rowFactory.createRow(lineData, 0, true, style, 0, false, 5, 20);
                chai_1.assert.equal(getFragmentHtml(fragment), `<span class="xterm-cursor xterm-cursor-${style}"> </span>`);
            }
        });
        it('should add class for cursor blink', () => {
            const fragment = rowFactory.createRow(lineData, 0, true, 'block', 0, true, 5, 20);
            chai_1.assert.equal(getFragmentHtml(fragment), `<span class="xterm-cursor xterm-cursor-blink xterm-cursor-block"> </span>`);
        });
        it('should not render cells that go beyond the terminal\'s columns', () => {
            lineData.setCell(0, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'a', 1, 'a'.charCodeAt(0)]));
            lineData.setCell(1, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'b', 1, 'b'.charCodeAt(0)]));
            const fragment = rowFactory.createRow(lineData, 0, false, undefined, 0, false, 5, 1);
            chai_1.assert.equal(getFragmentHtml(fragment), '<span>a</span>');
        });
        describe('attributes', () => {
            it('should add class for bold', () => {
                const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                cell.fg = BufferLine_1.DEFAULT_ATTR_DATA.fg | 134217728;
                lineData.setCell(0, cell);
                const fragment = rowFactory.createRow(lineData, 0, false, undefined, 0, false, 5, 20);
                chai_1.assert.equal(getFragmentHtml(fragment), '<span class="xterm-bold">a</span>');
            });
            it('should add class for italic', () => {
                const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                cell.bg = BufferLine_1.DEFAULT_ATTR_DATA.bg | 67108864;
                lineData.setCell(0, cell);
                const fragment = rowFactory.createRow(lineData, 0, false, undefined, 0, false, 5, 20);
                chai_1.assert.equal(getFragmentHtml(fragment), '<span class="xterm-italic">a</span>');
            });
            it('should add class for dim', () => {
                const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                cell.bg = BufferLine_1.DEFAULT_ATTR_DATA.bg | 134217728;
                lineData.setCell(0, cell);
                const fragment = rowFactory.createRow(lineData, 0, false, undefined, 0, false, 5, 20);
                chai_1.assert.equal(getFragmentHtml(fragment), '<span class="xterm-dim">a</span>');
            });
            describe('underline', () => {
                it('should add class for straight underline style', () => {
                    const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                    cell.fg = BufferLine_1.DEFAULT_ATTR_DATA.fg | 268435456;
                    cell.bg = BufferLine_1.DEFAULT_ATTR_DATA.bg | 268435456;
                    cell.extended.underlineStyle = 1;
                    lineData.setCell(0, cell);
                    const fragment = rowFactory.createRow(lineData, 0, false, undefined, 0, false, 5, 20);
                    chai_1.assert.equal(getFragmentHtml(fragment), '<span class="xterm-underline-1">a</span>');
                });
                it('should add class for double underline style', () => {
                    const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                    cell.fg = BufferLine_1.DEFAULT_ATTR_DATA.fg | 268435456;
                    cell.bg = BufferLine_1.DEFAULT_ATTR_DATA.bg | 268435456;
                    cell.extended.underlineStyle = 2;
                    lineData.setCell(0, cell);
                    const fragment = rowFactory.createRow(lineData, 0, false, undefined, 0, false, 5, 20);
                    chai_1.assert.equal(getFragmentHtml(fragment), '<span class="xterm-underline-2">a</span>');
                });
                it('should add class for curly underline style', () => {
                    const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                    cell.fg = BufferLine_1.DEFAULT_ATTR_DATA.fg | 268435456;
                    cell.bg = BufferLine_1.DEFAULT_ATTR_DATA.bg | 268435456;
                    cell.extended.underlineStyle = 3;
                    lineData.setCell(0, cell);
                    const fragment = rowFactory.createRow(lineData, 0, false, undefined, 0, false, 5, 20);
                    chai_1.assert.equal(getFragmentHtml(fragment), '<span class="xterm-underline-3">a</span>');
                });
                it('should add class for double dotted style', () => {
                    const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                    cell.fg = BufferLine_1.DEFAULT_ATTR_DATA.fg | 268435456;
                    cell.bg = BufferLine_1.DEFAULT_ATTR_DATA.bg | 268435456;
                    cell.extended.underlineStyle = 4;
                    lineData.setCell(0, cell);
                    const fragment = rowFactory.createRow(lineData, 0, false, undefined, 0, false, 5, 20);
                    chai_1.assert.equal(getFragmentHtml(fragment), '<span class="xterm-underline-4">a</span>');
                });
                it('should add class for dashed underline style', () => {
                    const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                    cell.fg = BufferLine_1.DEFAULT_ATTR_DATA.fg | 268435456;
                    cell.bg = BufferLine_1.DEFAULT_ATTR_DATA.bg | 268435456;
                    cell.extended.underlineStyle = 5;
                    lineData.setCell(0, cell);
                    const fragment = rowFactory.createRow(lineData, 0, false, undefined, 0, false, 5, 20);
                    chai_1.assert.equal(getFragmentHtml(fragment), '<span class="xterm-underline-5">a</span>');
                });
            });
            it('should add class for strikethrough', () => {
                const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                cell.fg = BufferLine_1.DEFAULT_ATTR_DATA.fg | 2147483648;
                lineData.setCell(0, cell);
                const fragment = rowFactory.createRow(lineData, 0, false, undefined, 0, false, 5, 20);
                chai_1.assert.equal(getFragmentHtml(fragment), '<span class="xterm-strikethrough">a</span>');
            });
            it('should add classes for 256 foreground colors', () => {
                const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                cell.fg |= 33554432;
                for (let i = 0; i < 256; i++) {
                    cell.fg &= ~255;
                    cell.fg |= i;
                    lineData.setCell(0, cell);
                    const fragment = rowFactory.createRow(lineData, 0, false, undefined, 0, false, 5, 20);
                    chai_1.assert.equal(getFragmentHtml(fragment), `<span class="xterm-fg-${i}">a</span>`);
                }
            });
            it('should add classes for 256 background colors', () => {
                const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                cell.bg |= 33554432;
                for (let i = 0; i < 256; i++) {
                    cell.bg &= ~255;
                    cell.bg |= i;
                    lineData.setCell(0, cell);
                    const fragment = rowFactory.createRow(lineData, 0, false, undefined, 0, false, 5, 20);
                    chai_1.assert.equal(getFragmentHtml(fragment), `<span class="xterm-bg-${i}">a</span>`);
                }
            });
            it('should correctly invert colors', () => {
                const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                cell.fg |= 16777216 | 2 | 67108864;
                cell.bg |= 16777216 | 1;
                lineData.setCell(0, cell);
                const fragment = rowFactory.createRow(lineData, 0, false, undefined, 0, false, 5, 20);
                chai_1.assert.equal(getFragmentHtml(fragment), '<span class="xterm-bg-2 xterm-fg-1">a</span>');
            });
            it('should correctly invert default fg color', () => {
                const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                cell.fg |= 67108864;
                cell.bg |= 16777216 | 1;
                lineData.setCell(0, cell);
                const fragment = rowFactory.createRow(lineData, 0, false, undefined, 0, false, 5, 20);
                chai_1.assert.equal(getFragmentHtml(fragment), '<span class="xterm-bg-257 xterm-fg-1">a</span>');
            });
            it('should correctly invert default bg color', () => {
                const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                cell.fg |= 16777216 | 1 | 67108864;
                lineData.setCell(0, cell);
                const fragment = rowFactory.createRow(lineData, 0, false, undefined, 0, false, 5, 20);
                chai_1.assert.equal(getFragmentHtml(fragment), '<span class="xterm-bg-1 xterm-fg-257">a</span>');
            });
            it('should turn bold fg text bright', () => {
                const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                cell.fg |= 134217728 | 16777216;
                for (let i = 0; i < 8; i++) {
                    cell.fg &= ~255;
                    cell.fg |= i;
                    lineData.setCell(0, cell);
                    const fragment = rowFactory.createRow(lineData, 0, false, undefined, 0, false, 5, 20);
                    chai_1.assert.equal(getFragmentHtml(fragment), `<span class="xterm-bold xterm-fg-${i + 8}">a</span>`);
                }
            });
            it('should set style attribute for RBG', () => {
                const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                cell.fg |= 50331648 | 1 << 16 | 2 << 8 | 3;
                cell.bg |= 50331648 | 4 << 16 | 5 << 8 | 6;
                lineData.setCell(0, cell);
                const fragment = rowFactory.createRow(lineData, 0, false, undefined, 0, false, 5, 20);
                chai_1.assert.equal(getFragmentHtml(fragment), '<span style="background-color:#040506;color:#010203;">a</span>');
            });
            it('should correctly invert RGB colors', () => {
                const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                cell.fg |= 50331648 | 1 << 16 | 2 << 8 | 3 | 67108864;
                cell.bg |= 50331648 | 4 << 16 | 5 << 8 | 6;
                lineData.setCell(0, cell);
                const fragment = rowFactory.createRow(lineData, 0, false, undefined, 0, false, 5, 20);
                chai_1.assert.equal(getFragmentHtml(fragment), '<span style="background-color:#010203;color:#040506;">a</span>');
            });
        });
        describe('selectionForeground', () => {
            it('should force selected cells with content to be rendered above the background', () => {
                lineData.setCell(0, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'a', 1, 'a'.charCodeAt(0)]));
                lineData.setCell(1, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'b', 1, 'b'.charCodeAt(0)]));
                rowFactory.onSelectionChanged([1, 0], [2, 0], false);
                const fragment = rowFactory.createRow(lineData, 0, false, undefined, 0, false, 5, 20);
                chai_1.assert.equal(getFragmentHtml(fragment), '<span>a</span><span class="xterm-decoration-top">b</span>');
            });
            it('should force whitespace cells to be rendered above the background', () => {
                lineData.setCell(1, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'a', 1, 'a'.charCodeAt(0)]));
                rowFactory.onSelectionChanged([0, 0], [2, 0], false);
                const fragment = rowFactory.createRow(lineData, 0, false, undefined, 0, false, 5, 20);
                chai_1.assert.equal(getFragmentHtml(fragment), '<span class="xterm-decoration-top"> </span><span class="xterm-decoration-top">a</span>');
            });
        });
    });
    function getFragmentHtml(fragment) {
        const element = dom.window.document.createElement('div');
        element.appendChild(fragment);
        return element.innerHTML;
    }
    function createEmptyLineData(cols) {
        const lineData = new BufferLine_1.BufferLine(cols);
        for (let i = 0; i < cols; i++) {
            lineData.setCell(i, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, Constants_1.NULL_CELL_WIDTH, Constants_1.NULL_CELL_CODE]));
        }
        return lineData;
    }
});
//# sourceMappingURL=DomRendererRowFactory.test.js.map