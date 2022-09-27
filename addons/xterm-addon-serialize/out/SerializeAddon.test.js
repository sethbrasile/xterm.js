"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom = require("jsdom");
const chai_1 = require("chai");
const SerializeAddon_1 = require("./SerializeAddon");
const Terminal_1 = require("browser/public/Terminal");
const ColorManager_1 = require("browser/ColorManager");
const SelectionModel_1 = require("browser/selection/SelectionModel");
function sgr(...seq) {
    return `\x1b[${seq.join(';')}m`;
}
function writeP(terminal, data) {
    return new Promise(r => terminal.write(data, r));
}
class TestSelectionService {
    constructor(bufferService) {
        this._hasSelection = false;
        this._model = new SelectionModel_1.SelectionModel(bufferService);
    }
    get model() { return this._model; }
    get hasSelection() { return this._hasSelection; }
    get selectionStart() { return this._model.finalSelectionStart; }
    get selectionEnd() { return this._model.finalSelectionEnd; }
    setSelection(col, row, length) {
        this._model.selectionStart = [col, row];
        this._model.selectionStartLength = length;
        this._hasSelection = true;
    }
}
describe('xterm-addon-serialize', () => {
    let cm;
    let dom;
    let document;
    let window;
    let serializeAddon;
    let terminal;
    let selectionService;
    before(() => {
        serializeAddon = new SerializeAddon_1.SerializeAddon();
    });
    beforeEach(() => {
        dom = new jsdom.JSDOM('');
        window = dom.window;
        document = window.document;
        window.HTMLCanvasElement.prototype.getContext = () => ({
            createLinearGradient() {
                return null;
            },
            fillRect() { },
            getImageData() {
                return { data: [0, 0, 0, 0xFF] };
            }
        });
        terminal = new Terminal_1.Terminal({ cols: 10, rows: 2, allowProposedApi: true });
        terminal.loadAddon(serializeAddon);
        selectionService = new TestSelectionService(terminal._core._bufferService);
        cm = new ColorManager_1.ColorManager(document, false);
        terminal._core._colorManager = cm;
        terminal._core._selectionService = selectionService;
    });
    describe('text', () => {
        it('restoring cursor styles', () => __awaiter(void 0, void 0, void 0, function* () {
            yield writeP(terminal, sgr('32') + '> ' + sgr('0'));
            chai_1.assert.equal(serializeAddon.serialize(), '\u001b[32m> \u001b[0m');
        }));
    });
    describe('html', () => {
        it('empty terminal with selection turned off', () => {
            const output = serializeAddon.serializeAsHTML();
            chai_1.assert.notEqual(output, '');
            chai_1.assert.equal((output.match(/<div><span> {10}<\/span><\/div>/g) || []).length, 2);
        });
        it('empty terminal with no selection', () => {
            const output = serializeAddon.serializeAsHTML({
                onlySelection: true
            });
            chai_1.assert.equal(output, '');
        });
        it('basic terminal with selection', () => __awaiter(void 0, void 0, void 0, function* () {
            yield writeP(terminal, ' terminal ');
            terminal.select(1, 0, 8);
            const output = serializeAddon.serializeAsHTML({
                onlySelection: true
            });
            chai_1.assert.equal((output.match(/<div><span>terminal<\/span><\/div>/g) || []).length, 1, output);
        }));
        it('cells with bold styling', () => __awaiter(void 0, void 0, void 0, function* () {
            yield writeP(terminal, ' ' + sgr('1') + 'terminal' + sgr('22') + ' ');
            const output = serializeAddon.serializeAsHTML();
            chai_1.assert.equal((output.match(/<span style='font-weight: bold;'>terminal<\/span>/g) || []).length, 1, output);
        }));
        it('cells with italic styling', () => __awaiter(void 0, void 0, void 0, function* () {
            yield writeP(terminal, ' ' + sgr('3') + 'terminal' + sgr('23') + ' ');
            const output = serializeAddon.serializeAsHTML();
            chai_1.assert.equal((output.match(/<span style='font-style: italic;'>terminal<\/span>/g) || []).length, 1, output);
        }));
        it('cells with inverse styling', () => __awaiter(void 0, void 0, void 0, function* () {
            yield writeP(terminal, ' ' + sgr('7') + 'terminal' + sgr('27') + ' ');
            const output = serializeAddon.serializeAsHTML();
            chai_1.assert.equal((output.match(/<span style='color: #000000; background-color: #BFBFBF;'>terminal<\/span>/g) || []).length, 1, output);
        }));
        it('cells with underline styling', () => __awaiter(void 0, void 0, void 0, function* () {
            yield writeP(terminal, ' ' + sgr('4') + 'terminal' + sgr('24') + ' ');
            const output = serializeAddon.serializeAsHTML();
            chai_1.assert.equal((output.match(/<span style='text-decoration: underline;'>terminal<\/span>/g) || []).length, 1, output);
        }));
        it('cells with invisible styling', () => __awaiter(void 0, void 0, void 0, function* () {
            yield writeP(terminal, ' ' + sgr('8') + 'terminal' + sgr('28') + ' ');
            const output = serializeAddon.serializeAsHTML();
            chai_1.assert.equal((output.match(/<span style='visibility: hidden;'>terminal<\/span>/g) || []).length, 1, output);
        }));
        it('cells with dim styling', () => __awaiter(void 0, void 0, void 0, function* () {
            yield writeP(terminal, ' ' + sgr('2') + 'terminal' + sgr('22') + ' ');
            const output = serializeAddon.serializeAsHTML();
            chai_1.assert.equal((output.match(/<span style='opacity: 0.5;'>terminal<\/span>/g) || []).length, 1, output);
        }));
        it('cells with strikethrough styling', () => __awaiter(void 0, void 0, void 0, function* () {
            yield writeP(terminal, ' ' + sgr('9') + 'terminal' + sgr('29') + ' ');
            const output = serializeAddon.serializeAsHTML();
            chai_1.assert.equal((output.match(/<span style='text-decoration: line-through;'>terminal<\/span>/g) || []).length, 1, output);
        }));
        it('cells with combined styling', () => __awaiter(void 0, void 0, void 0, function* () {
            yield writeP(terminal, sgr('1') + ' ' + sgr('9') + 'termi' + sgr('22') + 'nal' + sgr('29') + ' ');
            const output = serializeAddon.serializeAsHTML();
            chai_1.assert.equal((output.match(/<span style='font-weight: bold;'> <\/span>/g) || []).length, 1, output);
            chai_1.assert.equal((output.match(/<span style='font-weight: bold; text-decoration: line-through;'>termi<\/span>/g) || []).length, 1, output);
            chai_1.assert.equal((output.match(/<span style='text-decoration: line-through;'>nal<\/span>/g) || []).length, 1, output);
        }));
        it('cells with color styling', () => __awaiter(void 0, void 0, void 0, function* () {
            yield writeP(terminal, ' ' + sgr('38;5;46') + 'terminal' + sgr('39') + ' ');
            const output = serializeAddon.serializeAsHTML();
            chai_1.assert.equal((output.match(/<span style='color: #00ff00;'>terminal<\/span>/g) || []).length, 1, output);
        }));
        it('cells with background styling', () => __awaiter(void 0, void 0, void 0, function* () {
            yield writeP(terminal, ' ' + sgr('48;5;46') + 'terminal' + sgr('49') + ' ');
            const output = serializeAddon.serializeAsHTML();
            chai_1.assert.equal((output.match(/<span style='background-color: #00ff00;'>terminal<\/span>/g) || []).length, 1, output);
        }));
        it('empty terminal with default options', () => __awaiter(void 0, void 0, void 0, function* () {
            const output = serializeAddon.serializeAsHTML();
            chai_1.assert.equal((output.match(/color: #000000; background-color: #ffffff; font-family: courier-new, courier, monospace; font-size: 15px;/g) || []).length, 1, output);
        }));
        it('empty terminal with custom options', () => __awaiter(void 0, void 0, void 0, function* () {
            terminal.options.fontFamily = 'verdana';
            terminal.options.fontSize = 20;
            terminal.options.theme = {
                foreground: '#ff00ff',
                background: '#00ff00'
            };
            const output = serializeAddon.serializeAsHTML({
                includeGlobalBackground: true
            });
            chai_1.assert.equal((output.match(/color: #ff00ff; background-color: #00ff00; font-family: verdana; font-size: 20px;/g) || []).length, 1, output);
        }));
        it('empty terminal with background included', () => __awaiter(void 0, void 0, void 0, function* () {
            const output = serializeAddon.serializeAsHTML({
                includeGlobalBackground: true
            });
            chai_1.assert.equal((output.match(/color: #ffffff; background-color: #000000; font-family: courier-new, courier, monospace; font-size: 15px;/g) || []).length, 1, output);
        }));
    });
});
//# sourceMappingURL=SerializeAddon.test.js.map