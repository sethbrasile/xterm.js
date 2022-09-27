import { ICoreBrowserService } from './Services';
export declare class CoreBrowserService implements ICoreBrowserService {
    private _textarea;
    readonly window: Window & typeof globalThis;
    serviceBrand: undefined;
    constructor(_textarea: HTMLTextAreaElement, window: Window & typeof globalThis);
    get dpr(): number;
    get isFocused(): boolean;
}
//# sourceMappingURL=CoreBrowserService.d.ts.map