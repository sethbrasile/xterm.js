import { IEvent, IEventEmitter } from 'common/EventEmitter';
import { IBuffer, IBufferSet } from 'common/buffer/Types';
import { IDecPrivateModes, ICoreMouseEvent, CoreMouseEncoding, ICoreMouseProtocol, CoreMouseEventType, ICharset, IWindowOptions, IModes, IAttributeData, ScrollSource, IDisposable, IColor, CursorStyle, IOscLinkData } from 'common/Types';
import { IDecorationOptions, IDecoration, ILinkHandler } from 'xterm';
export declare const IBufferService: IServiceIdentifier<IBufferService>;
export interface IBufferService {
    serviceBrand: undefined;
    readonly cols: number;
    readonly rows: number;
    readonly buffer: IBuffer;
    readonly buffers: IBufferSet;
    isUserScrolling: boolean;
    onResize: IEvent<{
        cols: number;
        rows: number;
    }>;
    onScroll: IEvent<number>;
    scroll(eraseAttr: IAttributeData, isWrapped?: boolean): void;
    scrollToBottom(): void;
    scrollToTop(): void;
    scrollToLine(line: number): void;
    scrollLines(disp: number, suppressScrollEvent?: boolean, source?: ScrollSource): void;
    scrollPages(pageCount: number): void;
    resize(cols: number, rows: number): void;
    reset(): void;
}
export declare const ICoreMouseService: IServiceIdentifier<ICoreMouseService>;
export interface ICoreMouseService {
    activeProtocol: string;
    activeEncoding: string;
    areMouseEventsActive: boolean;
    addProtocol(name: string, protocol: ICoreMouseProtocol): void;
    addEncoding(name: string, encoding: CoreMouseEncoding): void;
    reset(): void;
    triggerMouseEvent(event: ICoreMouseEvent): boolean;
    onProtocolChange: IEvent<CoreMouseEventType>;
    explainEvents(events: CoreMouseEventType): {
        [event: string]: boolean;
    };
}
export declare const ICoreService: IServiceIdentifier<ICoreService>;
export interface ICoreService {
    serviceBrand: undefined;
    isCursorInitialized: boolean;
    isCursorHidden: boolean;
    readonly modes: IModes;
    readonly decPrivateModes: IDecPrivateModes;
    readonly onData: IEvent<string>;
    readonly onUserInput: IEvent<void>;
    readonly onBinary: IEvent<string>;
    reset(): void;
    triggerDataEvent(data: string, wasUserInput?: boolean): void;
    triggerBinaryEvent(data: string): void;
}
export declare const ICharsetService: IServiceIdentifier<ICharsetService>;
export interface ICharsetService {
    serviceBrand: undefined;
    charset: ICharset | undefined;
    readonly glevel: number;
    reset(): void;
    setgLevel(g: number): void;
    setgCharset(g: number, charset: ICharset | undefined): void;
}
export declare const IDirtyRowService: IServiceIdentifier<IDirtyRowService>;
export interface IDirtyRowService {
    serviceBrand: undefined;
    readonly start: number;
    readonly end: number;
    clearRange(): void;
    markDirty(y: number): void;
    markRangeDirty(y1: number, y2: number): void;
    markAllDirty(): void;
}
export interface IServiceIdentifier<T> {
    (...args: any[]): void;
    type: T;
}
export interface IBrandedService {
    serviceBrand: undefined;
}
declare type GetLeadingNonServiceArgs<Args> = Args extends [...IBrandedService[]] ? [] : Args extends [infer A1, ...IBrandedService[]] ? [A1] : Args extends [infer A1, infer A2, ...IBrandedService[]] ? [A1, A2] : Args extends [infer A1, infer A2, infer A3, ...IBrandedService[]] ? [A1, A2, A3] : Args extends [infer A1, infer A2, infer A3, infer A4, ...IBrandedService[]] ? [A1, A2, A3, A4] : Args extends [infer A1, infer A2, infer A3, infer A4, infer A5, ...IBrandedService[]] ? [A1, A2, A3, A4, A5] : Args extends [infer A1, infer A2, infer A3, infer A4, infer A5, infer A6, ...IBrandedService[]] ? [A1, A2, A3, A4, A5, A6] : Args extends [infer A1, infer A2, infer A3, infer A4, infer A5, infer A6, infer A7, ...IBrandedService[]] ? [A1, A2, A3, A4, A5, A6, A7] : Args extends [infer A1, infer A2, infer A3, infer A4, infer A5, infer A6, infer A7, infer A8, ...IBrandedService[]] ? [A1, A2, A3, A4, A5, A6, A7, A8] : never;
export declare const IInstantiationService: IServiceIdentifier<IInstantiationService>;
export interface IInstantiationService {
    serviceBrand: undefined;
    setService<T>(id: IServiceIdentifier<T>, instance: T): void;
    getService<T>(id: IServiceIdentifier<T>): T | undefined;
    createInstance<Ctor extends new (...args: any[]) => any, R extends InstanceType<Ctor>>(t: Ctor, ...args: GetLeadingNonServiceArgs<ConstructorParameters<Ctor>>): R;
}
export declare enum LogLevelEnum {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    OFF = 4
}
export declare const ILogService: IServiceIdentifier<ILogService>;
export interface ILogService {
    serviceBrand: undefined;
    logLevel: LogLevelEnum;
    debug(message: any, ...optionalParams: any[]): void;
    info(message: any, ...optionalParams: any[]): void;
    warn(message: any, ...optionalParams: any[]): void;
    error(message: any, ...optionalParams: any[]): void;
}
export declare const IOptionsService: IServiceIdentifier<IOptionsService>;
export interface IOptionsService {
    serviceBrand: undefined;
    readonly rawOptions: Required<ITerminalOptions>;
    readonly options: Required<ITerminalOptions>;
    readonly onOptionChange: IEvent<string>;
}
export declare type FontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | number;
export declare type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'off';
export interface ITerminalOptions {
    allowProposedApi?: boolean;
    allowTransparency?: boolean;
    altClickMovesCursor?: boolean;
    cols?: number;
    convertEol?: boolean;
    cursorBlink?: boolean;
    cursorStyle?: CursorStyle;
    cursorWidth?: number;
    customGlyphs?: boolean;
    disableStdin?: boolean;
    drawBoldTextInBrightColors?: boolean;
    fastScrollModifier?: 'none' | 'alt' | 'ctrl' | 'shift';
    fastScrollSensitivity?: number;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: FontWeight;
    fontWeightBold?: FontWeight;
    letterSpacing?: number;
    lineHeight?: number;
    linkHandler?: ILinkHandler | null;
    logLevel?: LogLevel;
    macOptionIsMeta?: boolean;
    macOptionClickForcesSelection?: boolean;
    minimumContrastRatio?: number;
    rightClickSelectsWord?: boolean;
    rows?: number;
    screenReaderMode?: boolean;
    scrollback?: number;
    scrollSensitivity?: number;
    smoothScrollDuration?: number;
    tabStopWidth?: number;
    theme?: ITheme;
    windowsMode?: boolean;
    windowOptions?: IWindowOptions;
    wordSeparator?: string;
    overviewRulerWidth?: number;
    [key: string]: any;
    cancelEvents: boolean;
    termName: string;
}
export interface ITheme {
    foreground?: string;
    background?: string;
    cursor?: string;
    cursorAccent?: string;
    selectionForeground?: string;
    selectionBackground?: string;
    selectionInactiveBackground?: string;
    black?: string;
    red?: string;
    green?: string;
    yellow?: string;
    blue?: string;
    magenta?: string;
    cyan?: string;
    white?: string;
    brightBlack?: string;
    brightRed?: string;
    brightGreen?: string;
    brightYellow?: string;
    brightBlue?: string;
    brightMagenta?: string;
    brightCyan?: string;
    brightWhite?: string;
    extendedAnsi?: string[];
}
export declare const IOscLinkService: IServiceIdentifier<IOscLinkService>;
export interface IOscLinkService {
    serviceBrand: undefined;
    registerLink(linkData: IOscLinkData): number;
    addLineToLink(linkId: number, y: number): void;
    getLinkData(linkId: number): IOscLinkData | undefined;
}
export declare const IUnicodeService: IServiceIdentifier<IUnicodeService>;
export interface IUnicodeService {
    serviceBrand: undefined;
    register(provider: IUnicodeVersionProvider): void;
    readonly versions: string[];
    activeVersion: string;
    readonly onChange: IEvent<string>;
    wcwidth(codepoint: number): number;
    getStringCellWidth(s: string): number;
}
export interface IUnicodeVersionProvider {
    readonly version: string;
    wcwidth(ucs: number): 0 | 1 | 2;
}
export declare const IDecorationService: IServiceIdentifier<IDecorationService>;
export interface IDecorationService extends IDisposable {
    serviceBrand: undefined;
    readonly decorations: IterableIterator<IInternalDecoration>;
    readonly onDecorationRegistered: IEvent<IInternalDecoration>;
    readonly onDecorationRemoved: IEvent<IInternalDecoration>;
    registerDecoration(decorationOptions: IDecorationOptions): IDecoration | undefined;
    reset(): void;
    forEachDecorationAtCell(x: number, line: number, layer: 'bottom' | 'top' | undefined, callback: (decoration: IInternalDecoration) => void): void;
}
export interface IInternalDecoration extends IDecoration {
    readonly options: IDecorationOptions;
    readonly backgroundColorRGB: IColor | undefined;
    readonly foregroundColorRGB: IColor | undefined;
    readonly onRenderEmitter: IEventEmitter<HTMLElement>;
}
export {};
//# sourceMappingURL=Services.d.ts.map