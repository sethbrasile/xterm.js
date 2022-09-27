import { IBuffer, IBufferSet } from 'common/buffer/Types';
import { IAttributeData } from 'common/Types';
import { Buffer } from 'common/buffer/Buffer';
import { IEvent } from 'common/EventEmitter';
import { IOptionsService, IBufferService } from 'common/services/Services';
import { Disposable } from 'common/Lifecycle';
export declare class BufferSet extends Disposable implements IBufferSet {
    private readonly _optionsService;
    private readonly _bufferService;
    private _normal;
    private _alt;
    private _activeBuffer;
    private _onBufferActivate;
    get onBufferActivate(): IEvent<{
        activeBuffer: IBuffer;
        inactiveBuffer: IBuffer;
    }>;
    constructor(_optionsService: IOptionsService, _bufferService: IBufferService);
    reset(): void;
    get alt(): Buffer;
    get active(): Buffer;
    get normal(): Buffer;
    activateNormalBuffer(): void;
    activateAltBuffer(fillAttr?: IAttributeData): void;
    resize(newCols: number, newRows: number): void;
    setupTabStops(i?: number): void;
}
//# sourceMappingURL=BufferSet.d.ts.map