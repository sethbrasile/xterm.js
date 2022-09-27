export declare function getCoordsRelativeToElement(window: Pick<Window, 'getComputedStyle'>, event: {
    clientX: number;
    clientY: number;
}, element: HTMLElement): [number, number];
export declare function getCoords(window: Pick<Window, 'getComputedStyle'>, event: {
    clientX: number;
    clientY: number;
}, element: HTMLElement, colCount: number, rowCount: number, hasValidCharSize: boolean, actualCellWidth: number, actualCellHeight: number, isSelection?: boolean): [number, number] | undefined;
//# sourceMappingURL=Mouse.d.ts.map