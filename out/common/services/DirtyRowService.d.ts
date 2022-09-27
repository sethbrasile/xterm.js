import { IBufferService, IDirtyRowService } from 'common/services/Services';
export declare class DirtyRowService implements IDirtyRowService {
    private readonly _bufferService;
    serviceBrand: any;
    private _start;
    private _end;
    get start(): number;
    get end(): number;
    constructor(_bufferService: IBufferService);
    clearRange(): void;
    markDirty(y: number): void;
    markRangeDirty(y1: number, y2: number): void;
    markAllDirty(): void;
}
//# sourceMappingURL=DirtyRowService.d.ts.map