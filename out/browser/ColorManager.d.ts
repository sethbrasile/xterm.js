import { IColorManager, IColorSet } from 'browser/Types';
import { ITheme } from 'common/services/Services';
import { ColorIndex, IColor } from 'common/Types';
export declare const DEFAULT_ANSI_COLORS: readonly IColor[];
export declare class ColorManager implements IColorManager {
    allowTransparency: boolean;
    colors: IColorSet;
    private _ctx;
    private _litmusColor;
    private _contrastCache;
    private _restoreColors;
    constructor(document: Document, allowTransparency: boolean);
    onOptionsChange(key: string, value: any): void;
    setTheme(theme?: ITheme): void;
    restoreColor(slot?: ColorIndex): void;
    private _updateRestoreColors;
    private _parseColor;
}
//# sourceMappingURL=ColorManager.d.ts.map