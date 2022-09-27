import { IBuffer as IBufferApi, IBufferNamespace as IBufferNamespaceApi } from 'xterm';
import { IEvent } from 'common/EventEmitter';
import { ICoreTerminal } from 'common/Types';
export declare class BufferNamespaceApi implements IBufferNamespaceApi {
    private _core;
    private _normal;
    private _alternate;
    private _onBufferChange;
    get onBufferChange(): IEvent<IBufferApi>;
    constructor(_core: ICoreTerminal);
    get active(): IBufferApi;
    get normal(): IBufferApi;
    get alternate(): IBufferApi;
}
//# sourceMappingURL=BufferNamespaceApi.d.ts.map