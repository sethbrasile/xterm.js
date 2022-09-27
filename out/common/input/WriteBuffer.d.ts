import { IEvent } from 'common/EventEmitter';
export declare class WriteBuffer {
    private _action;
    private _writeBuffer;
    private _callbacks;
    private _pendingData;
    private _bufferOffset;
    private _isSyncWriting;
    private _syncCalls;
    get onWriteParsed(): IEvent<void>;
    private _onWriteParsed;
    constructor(_action: (data: string | Uint8Array, promiseResult?: boolean) => void | Promise<boolean>);
    writeSync(data: string | Uint8Array, maxSubsequentCalls?: number): void;
    write(data: string | Uint8Array, callback?: () => void): void;
    protected _innerWrite(lastTime?: number, promiseResult?: boolean): void;
}
//# sourceMappingURL=WriteBuffer.d.ts.map