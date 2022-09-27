import { IOptionsService, ITerminalOptions } from 'common/services/Services';
import { IEvent } from 'common/EventEmitter';
export declare const DEFAULT_OPTIONS: Readonly<Required<ITerminalOptions>>;
export declare class OptionsService implements IOptionsService {
    serviceBrand: any;
    readonly rawOptions: Required<ITerminalOptions>;
    options: Required<ITerminalOptions>;
    private _onOptionChange;
    get onOptionChange(): IEvent<string>;
    constructor(options: Partial<ITerminalOptions>);
    private _setupOptions;
    private _sanitizeAndValidateOption;
}
//# sourceMappingURL=OptionsService.d.ts.map