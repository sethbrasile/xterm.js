import { IBufferService, IOptionsService } from 'common/services/Services';
import { IBufferSet, IBuffer } from 'common/buffer/Types';
import { IEvent } from 'common/EventEmitter';
import { Disposable } from 'common/Lifecycle';
import { IAttributeData, ScrollSource } from 'common/Types';
export declare const MINIMUM_COLS = 2;
export declare const MINIMUM_ROWS = 1;
export declare class BufferService extends Disposable implements IBufferService {
    serviceBrand: any;
    cols: number;
    rows: number;
    buffers: IBufferSet;
    isUserScrolling: boolean;
    private _onResize;
    get onResize(): IEvent<{
        cols: number;
        rows: number;
    }>;
    private _onScroll;
    get onScroll(): IEvent<number>;
    get buffer(): IBuffer;
    private _cachedBlankLine;
    constructor(optionsService: IOptionsService);
    dispose(): void;
    resize(cols: number, rows: number): void;
    reset(): void;
    scroll(eraseAttr: IAttributeData, isWrapped?: boolean): void;
    scrollLines(disp: number, suppressScrollEvent?: boolean, source?: ScrollSource): void;
    scrollPages(pageCount: number): void;
    scrollToTop(): void;
    scrollToBottom(): void;
    scrollToLine(line: number): void;
}
//# sourceMappingURL=BufferService.d.ts.map