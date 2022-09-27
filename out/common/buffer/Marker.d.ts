import { IEvent } from 'common/EventEmitter';
import { Disposable } from 'common/Lifecycle';
import { IMarker } from 'common/Types';
export declare class Marker extends Disposable implements IMarker {
    line: number;
    private static _nextId;
    private _id;
    isDisposed: boolean;
    get id(): number;
    private _onDispose;
    get onDispose(): IEvent<void>;
    constructor(line: number);
    dispose(): void;
}
//# sourceMappingURL=Marker.d.ts.map