import { IEvent } from 'common/EventEmitter';
import { IBufferNamespace as IBufferNamespaceApi, IMarker, IModes, IParser, ITerminalAddon, ITerminalInitOnlyOptions, IUnicodeHandling, Terminal as ITerminalApi } from 'xterm-headless';
import { ITerminalOptions } from 'common/Types';
export declare class Terminal implements ITerminalApi {
    private _core;
    private _addonManager;
    private _parser;
    private _buffer;
    private _publicOptions;
    constructor(options?: ITerminalOptions & ITerminalInitOnlyOptions);
    private _checkReadonlyOptions;
    private _checkProposedApi;
    get onBell(): IEvent<void>;
    get onBinary(): IEvent<string>;
    get onCursorMove(): IEvent<void>;
    get onData(): IEvent<string>;
    get onLineFeed(): IEvent<void>;
    get onResize(): IEvent<{
        cols: number;
        rows: number;
    }>;
    get onScroll(): IEvent<number>;
    get onTitleChange(): IEvent<string>;
    get parser(): IParser;
    get unicode(): IUnicodeHandling;
    get rows(): number;
    get cols(): number;
    get buffer(): IBufferNamespaceApi;
    get markers(): ReadonlyArray<IMarker>;
    get modes(): IModes;
    get options(): Required<ITerminalOptions>;
    set options(options: ITerminalOptions);
    resize(columns: number, rows: number): void;
    registerMarker(cursorYOffset?: number): IMarker | undefined;
    addMarker(cursorYOffset: number): IMarker | undefined;
    dispose(): void;
    scrollLines(amount: number): void;
    scrollPages(pageCount: number): void;
    scrollToTop(): void;
    scrollToBottom(): void;
    scrollToLine(line: number): void;
    clear(): void;
    write(data: string | Uint8Array, callback?: () => void): void;
    writeln(data: string | Uint8Array, callback?: () => void): void;
    reset(): void;
    loadAddon(addon: ITerminalAddon): void;
    private _verifyIntegers;
}
//# sourceMappingURL=Terminal.d.ts.map