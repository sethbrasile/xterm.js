import { ILogService, IOptionsService, LogLevelEnum } from 'common/services/Services';
export declare class LogService implements ILogService {
    private readonly _optionsService;
    serviceBrand: any;
    logLevel: LogLevelEnum;
    constructor(_optionsService: IOptionsService);
    private _updateLogLevel;
    private _evalLazyOptionalParams;
    private _log;
    debug(message: string, ...optionalParams: any[]): void;
    info(message: string, ...optionalParams: any[]): void;
    warn(message: string, ...optionalParams: any[]): void;
    error(message: string, ...optionalParams: any[]): void;
}
//# sourceMappingURL=LogService.d.ts.map