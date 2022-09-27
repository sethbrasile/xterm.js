import { Disposable } from 'common/Lifecycle';
import { IInstantiationService, IOptionsService, IBufferService, ILogService, ICharsetService, ICoreService, ICoreMouseService, IUnicodeService, IDirtyRowService, ITerminalOptions, IOscLinkService } from 'common/services/Services';
import { IDisposable, IAttributeData, ICoreTerminal, IScrollEvent, ScrollSource } from 'common/Types';
import { EventEmitter, IEvent } from 'common/EventEmitter';
import { IFunctionIdentifier, IParams } from 'common/parser/Types';
import { IBufferSet } from 'common/buffer/Types';
import { InputHandler } from 'common/InputHandler';
export declare abstract class CoreTerminal extends Disposable implements ICoreTerminal {
    protected readonly _instantiationService: IInstantiationService;
    protected readonly _bufferService: IBufferService;
    protected readonly _logService: ILogService;
    protected readonly _charsetService: ICharsetService;
    protected readonly _dirtyRowService: IDirtyRowService;
    protected readonly _oscLinkService: IOscLinkService;
    readonly coreMouseService: ICoreMouseService;
    readonly coreService: ICoreService;
    readonly unicodeService: IUnicodeService;
    readonly optionsService: IOptionsService;
    protected _inputHandler: InputHandler;
    private _writeBuffer;
    private _windowsMode;
    private _onBinary;
    get onBinary(): IEvent<string>;
    private _onData;
    get onData(): IEvent<string>;
    protected _onLineFeed: EventEmitter<void, void>;
    get onLineFeed(): IEvent<void>;
    private _onResize;
    get onResize(): IEvent<{
        cols: number;
        rows: number;
    }>;
    protected _onScroll: EventEmitter<IScrollEvent, void>;
    get onWriteParsed(): IEvent<void>;
    protected _onWriteParsed: EventEmitter<void, void>;
    protected _onScrollApi?: EventEmitter<number, void>;
    get onScroll(): IEvent<number, void>;
    get cols(): number;
    get rows(): number;
    get buffers(): IBufferSet;
    get options(): Required<ITerminalOptions>;
    set options(options: ITerminalOptions);
    constructor(options: Partial<ITerminalOptions>);
    dispose(): void;
    write(data: string | Uint8Array, callback?: () => void): void;
    writeSync(data: string | Uint8Array, maxSubsequentCalls?: number): void;
    resize(x: number, y: number): void;
    scroll(eraseAttr: IAttributeData, isWrapped?: boolean): void;
    scrollLines(disp: number, suppressScrollEvent?: boolean, source?: ScrollSource): void;
    scrollPages(pageCount: number): void;
    scrollToTop(): void;
    scrollToBottom(): void;
    scrollToLine(line: number): void;
    registerEscHandler(id: IFunctionIdentifier, callback: () => boolean | Promise<boolean>): IDisposable;
    registerDcsHandler(id: IFunctionIdentifier, callback: (data: string, param: IParams) => boolean | Promise<boolean>): IDisposable;
    registerCsiHandler(id: IFunctionIdentifier, callback: (params: IParams) => boolean | Promise<boolean>): IDisposable;
    registerOscHandler(ident: number, callback: (data: string) => boolean | Promise<boolean>): IDisposable;
    protected _setup(): void;
    reset(): void;
    protected _updateOptions(key: string): void;
    protected _enableWindowsMode(): void;
}
//# sourceMappingURL=CoreTerminal.d.ts.map