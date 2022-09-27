import { ICoreService, ILogService, IOptionsService, IBufferService } from 'common/services/Services';
import { IEvent } from 'common/EventEmitter';
import { IDecPrivateModes, IModes } from 'common/Types';
import { Disposable } from 'common/Lifecycle';
export declare class CoreService extends Disposable implements ICoreService {
    private readonly _bufferService;
    private readonly _logService;
    private readonly _optionsService;
    serviceBrand: any;
    isCursorInitialized: boolean;
    isCursorHidden: boolean;
    modes: IModes;
    decPrivateModes: IDecPrivateModes;
    private _scrollToBottom;
    private _onData;
    get onData(): IEvent<string>;
    private _onUserInput;
    get onUserInput(): IEvent<void>;
    private _onBinary;
    get onBinary(): IEvent<string>;
    constructor(scrollToBottom: () => void, _bufferService: IBufferService, _logService: ILogService, _optionsService: IOptionsService);
    reset(): void;
    triggerDataEvent(data: string, wasUserInput?: boolean): void;
    triggerBinaryEvent(data: string): void;
}
//# sourceMappingURL=CoreService.d.ts.map