import { IBufferService, ICoreService, ICoreMouseService } from 'common/services/Services';
import { IEvent } from 'common/EventEmitter';
import { ICoreMouseProtocol, ICoreMouseEvent, CoreMouseEncoding, CoreMouseEventType } from 'common/Types';
export declare class CoreMouseService implements ICoreMouseService {
    private readonly _bufferService;
    private readonly _coreService;
    private _protocols;
    private _encodings;
    private _activeProtocol;
    private _activeEncoding;
    private _onProtocolChange;
    private _lastEvent;
    constructor(_bufferService: IBufferService, _coreService: ICoreService);
    addProtocol(name: string, protocol: ICoreMouseProtocol): void;
    addEncoding(name: string, encoding: CoreMouseEncoding): void;
    get activeProtocol(): string;
    get areMouseEventsActive(): boolean;
    set activeProtocol(name: string);
    get activeEncoding(): string;
    set activeEncoding(name: string);
    reset(): void;
    get onProtocolChange(): IEvent<CoreMouseEventType>;
    triggerMouseEvent(e: ICoreMouseEvent): boolean;
    explainEvents(events: CoreMouseEventType): {
        [event: string]: boolean;
    };
    private _equalEvents;
}
//# sourceMappingURL=CoreMouseService.d.ts.map