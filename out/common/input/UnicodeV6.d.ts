import { IUnicodeVersionProvider } from 'common/services/Services';
declare type CharWidth = 0 | 1 | 2;
export declare class UnicodeV6 implements IUnicodeVersionProvider {
    readonly version = "6";
    constructor();
    wcwidth(num: number): CharWidth;
}
export {};
//# sourceMappingURL=UnicodeV6.d.ts.map