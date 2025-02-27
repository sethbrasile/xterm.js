/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */

import jsdom = require('jsdom');
import { assert } from 'chai';
import { SerializeAddon } from './SerializeAddon';
import { Terminal } from 'browser/public/Terminal';
import { ColorManager } from 'browser/ColorManager';
import { SelectionModel } from 'browser/selection/SelectionModel';
import { IBufferService } from 'common/services/Services';

function sgr(...seq: string[]): string {
  return `\x1b[${seq.join(';')}m`;
}

function writeP(terminal: Terminal, data: string | Uint8Array): Promise<void> {
  return new Promise(r => terminal.write(data, r));
}

class TestSelectionService {
  private _model: SelectionModel;
  private _hasSelection: boolean = false;

  constructor(
    bufferService: IBufferService
  ) {
    this._model = new SelectionModel(bufferService);
  }

  public get model(): SelectionModel { return this._model; }

  public get hasSelection(): boolean { return this._hasSelection; }

  public get selectionStart(): [number, number] | undefined { return this._model.finalSelectionStart; }
  public get selectionEnd(): [number, number] | undefined { return this._model.finalSelectionEnd; }

  public setSelection(col: number, row: number, length: number): void {
    this._model.selectionStart = [col, row];
    this._model.selectionStartLength = length;
    this._hasSelection = true;
  }
}

describe('xterm-addon-serialize', () => {
  let cm: ColorManager;
  let dom: jsdom.JSDOM;
  let document: Document;
  let window: jsdom.DOMWindow;

  let serializeAddon: SerializeAddon;
  let terminal: Terminal;
  let selectionService: any;

  before(() => {
    serializeAddon = new SerializeAddon();
  });

  beforeEach(() => {
    dom = new jsdom.JSDOM('');
    window = dom.window;
    document = window.document;

    (window as any).HTMLCanvasElement.prototype.getContext = () => ({
      createLinearGradient(): any {
        return null;
      },

      fillRect(): void { },

      getImageData(): any {
        return { data: [0, 0, 0, 0xFF] };
      }
    });

    terminal = new Terminal({ cols: 10, rows: 2, allowProposedApi: true });
    terminal.loadAddon(serializeAddon);

    selectionService = new TestSelectionService((terminal as any)._core._bufferService);
    cm = new ColorManager();
    (terminal as any)._core._colorManager = cm;
    (terminal as any)._core._selectionService = selectionService;
  });

  describe('text', () => {
    it('restoring cursor styles', async () => {
      await writeP(terminal, sgr('32') + '> ' + sgr('0'));
      assert.equal(serializeAddon.serialize(), '\u001b[32m> \u001b[0m');
    });
  });

  describe('html', () => {
    it('empty terminal with selection turned off', () => {
      const output = serializeAddon.serializeAsHTML();
      assert.notEqual(output, '');
      assert.equal((output.match(/<div><span> {10}<\/span><\/div>/g) || []).length, 2);
    });

    it('empty terminal with no selection', () => {
      const output = serializeAddon.serializeAsHTML({
        onlySelection: true
      });
      assert.equal(output, '');
    });

    it('basic terminal with selection', async () => {
      await writeP(terminal, ' terminal ');
      terminal.select(1, 0, 8);

      const output = serializeAddon.serializeAsHTML({
        onlySelection: true
      });
      assert.equal((output.match(/<div><span>terminal<\/span><\/div>/g) || []).length, 1, output);
    });

    it('cells with bold styling', async () => {
      await writeP(terminal, ' ' + sgr('1') + 'terminal' + sgr('22') + ' ');

      const output = serializeAddon.serializeAsHTML();
      assert.equal((output.match(/<span style='font-weight: bold;'>terminal<\/span>/g) || []).length, 1, output);
    });

    it('cells with italic styling', async () => {
      await writeP(terminal, ' ' + sgr('3') + 'terminal' + sgr('23') + ' ');

      const output = serializeAddon.serializeAsHTML();
      assert.equal((output.match(/<span style='font-style: italic;'>terminal<\/span>/g) || []).length, 1, output);
    });

    it('cells with inverse styling', async () => {
      await writeP(terminal, ' ' + sgr('7') + 'terminal' + sgr('27') + ' ');

      const output = serializeAddon.serializeAsHTML();
      assert.equal((output.match(/<span style='color: #000000; background-color: #BFBFBF;'>terminal<\/span>/g) || []).length, 1, output);
    });

    it('cells with underline styling', async () => {
      await writeP(terminal, ' ' + sgr('4') + 'terminal' + sgr('24') + ' ');

      const output = serializeAddon.serializeAsHTML();
      assert.equal((output.match(/<span style='text-decoration: underline;'>terminal<\/span>/g) || []).length, 1, output);
    });

    it('cells with invisible styling', async () => {
      await writeP(terminal, ' ' + sgr('8') + 'terminal' + sgr('28') + ' ');

      const output = serializeAddon.serializeAsHTML();
      assert.equal((output.match(/<span style='visibility: hidden;'>terminal<\/span>/g) || []).length, 1, output);
    });

    it('cells with dim styling', async () => {
      await writeP(terminal, ' ' + sgr('2') + 'terminal' + sgr('22') + ' ');

      const output = serializeAddon.serializeAsHTML();
      assert.equal((output.match(/<span style='opacity: 0.5;'>terminal<\/span>/g) || []).length, 1, output);
    });

    it('cells with strikethrough styling', async () => {
      await writeP(terminal, ' ' + sgr('9') + 'terminal' + sgr('29') + ' ');

      const output = serializeAddon.serializeAsHTML();
      assert.equal((output.match(/<span style='text-decoration: line-through;'>terminal<\/span>/g) || []).length, 1, output);
    });

    it('cells with combined styling', async () => {
      await writeP(terminal, sgr('1') + ' ' + sgr('9') + 'termi' + sgr('22') + 'nal' + sgr('29') + ' ');

      const output = serializeAddon.serializeAsHTML();
      assert.equal((output.match(/<span style='font-weight: bold;'> <\/span>/g) || []).length, 1, output);
      assert.equal((output.match(/<span style='font-weight: bold; text-decoration: line-through;'>termi<\/span>/g) || []).length, 1, output);
      assert.equal((output.match(/<span style='text-decoration: line-through;'>nal<\/span>/g) || []).length, 1, output);
    });

    it('cells with color styling', async () => {
      await writeP(terminal, ' ' + sgr('38;5;46') + 'terminal' + sgr('39') + ' ');

      const output = serializeAddon.serializeAsHTML();
      assert.equal((output.match(/<span style='color: #00ff00;'>terminal<\/span>/g) || []).length, 1, output);
    });

    it('cells with background styling', async () => {
      await writeP(terminal, ' ' + sgr('48;5;46') + 'terminal' + sgr('49') + ' ');

      const output = serializeAddon.serializeAsHTML();
      assert.equal((output.match(/<span style='background-color: #00ff00;'>terminal<\/span>/g) || []).length, 1, output);
    });

    it('empty terminal with default options', async () => {
      const output = serializeAddon.serializeAsHTML();
      assert.equal((output.match(/color: #000000; background-color: #ffffff; font-family: courier-new, courier, monospace; font-size: 15px;/g) || []).length, 1, output);
    });

    it('empty terminal with custom options', async () => {
      terminal.options.fontFamily = 'verdana';
      terminal.options.fontSize = 20;
      terminal.options.theme = {
        foreground: '#ff00ff',
        background: '#00ff00'
      };
      const output = serializeAddon.serializeAsHTML({
        includeGlobalBackground: true
      });
      assert.equal((output.match(/color: #ff00ff; background-color: #00ff00; font-family: verdana; font-size: 20px;/g) || []).length, 1, output);
    });

    it('empty terminal with background included', async () => {
      const output = serializeAddon.serializeAsHTML({
        includeGlobalBackground: true
      });
      assert.equal((output.match(/color: #ffffff; background-color: #000000; font-family: courier-new, courier, monospace; font-size: 15px;/g) || []).length, 1, output);
    });
  });
});
