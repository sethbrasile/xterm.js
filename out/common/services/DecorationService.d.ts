import { Disposable } from 'common/Lifecycle';
import { IDecorationService, IInternalDecoration } from 'common/services/Services';
import { IDecorationOptions, IDecoration, IEvent } from 'xterm';
export declare class DecorationService extends Disposable implements IDecorationService {
    serviceBrand: any;
    private readonly _decorations;
    private _onDecorationRegistered;
    get onDecorationRegistered(): IEvent<IInternalDecoration>;
    private _onDecorationRemoved;
    get onDecorationRemoved(): IEvent<IInternalDecoration>;
    get decorations(): IterableIterator<IInternalDecoration>;
    registerDecoration(options: IDecorationOptions): IDecoration | undefined;
    reset(): void;
    getDecorationsAtCell(x: number, line: number, layer?: 'bottom' | 'top'): IterableIterator<IInternalDecoration>;
    forEachDecorationAtCell(x: number, line: number, layer: 'bottom' | 'top' | undefined, callback: (decoration: IInternalDecoration) => void): void;
    dispose(): void;
}
//# sourceMappingURL=DecorationService.d.ts.map