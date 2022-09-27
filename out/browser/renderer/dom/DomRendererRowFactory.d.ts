import { IBufferLine } from 'common/Types';
import { ICoreService, IDecorationService, IOptionsService } from 'common/services/Services';
import { IColorSet } from 'browser/Types';
import { ICharacterJoinerService, ICoreBrowserService } from 'browser/services/Services';
export declare const BOLD_CLASS = "xterm-bold";
export declare const DIM_CLASS = "xterm-dim";
export declare const ITALIC_CLASS = "xterm-italic";
export declare const UNDERLINE_CLASS = "xterm-underline";
export declare const STRIKETHROUGH_CLASS = "xterm-strikethrough";
export declare const CURSOR_CLASS = "xterm-cursor";
export declare const CURSOR_BLINK_CLASS = "xterm-cursor-blink";
export declare const CURSOR_STYLE_BLOCK_CLASS = "xterm-cursor-block";
export declare const CURSOR_STYLE_BAR_CLASS = "xterm-cursor-bar";
export declare const CURSOR_STYLE_UNDERLINE_CLASS = "xterm-cursor-underline";
export declare class DomRendererRowFactory {
    private readonly _document;
    private _colors;
    private readonly _characterJoinerService;
    private readonly _optionsService;
    private readonly _coreBrowserService;
    private readonly _coreService;
    private readonly _decorationService;
    private _workCell;
    private _selectionStart;
    private _selectionEnd;
    private _columnSelectMode;
    constructor(_document: Document, _colors: IColorSet, _characterJoinerService: ICharacterJoinerService, _optionsService: IOptionsService, _coreBrowserService: ICoreBrowserService, _coreService: ICoreService, _decorationService: IDecorationService);
    setColors(colors: IColorSet): void;
    onSelectionChanged(start: [number, number] | undefined, end: [number, number] | undefined, columnSelectMode: boolean): void;
    createRow(lineData: IBufferLine, row: number, isCursorRow: boolean, cursorStyle: string | undefined, cursorX: number, cursorBlink: boolean, cellWidth: number, cols: number): DocumentFragment;
    private _applyMinimumContrast;
    private _addStyle;
    private _isCellInSelection;
}
//# sourceMappingURL=DomRendererRowFactory.d.ts.map