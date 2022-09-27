import { IUnicodeService, IUnicodeVersionProvider } from 'common/services/Services';
import { IEvent } from 'common/EventEmitter';
export declare class UnicodeService implements IUnicodeService {
    serviceBrand: any;
    private _providers;
    private _active;
    private _activeProvider;
    private _onChange;
    get onChange(): IEvent<string>;
    constructor();
    get versions(): string[];
    get activeVersion(): string;
    set activeVersion(version: string);
    register(provider: IUnicodeVersionProvider): void;
    wcwidth(num: number): number;
    getStringCellWidth(s: string): number;
}
//# sourceMappingURL=UnicodeService.d.ts.map