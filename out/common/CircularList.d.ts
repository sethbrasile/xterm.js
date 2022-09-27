import { ICircularList } from 'common/Types';
import { EventEmitter, IEvent } from 'common/EventEmitter';
export interface IInsertEvent {
    index: number;
    amount: number;
}
export interface IDeleteEvent {
    index: number;
    amount: number;
}
export declare class CircularList<T> implements ICircularList<T> {
    private _maxLength;
    protected _array: (T | undefined)[];
    private _startIndex;
    private _length;
    onDeleteEmitter: EventEmitter<IDeleteEvent, void>;
    get onDelete(): IEvent<IDeleteEvent>;
    onInsertEmitter: EventEmitter<IInsertEvent, void>;
    get onInsert(): IEvent<IInsertEvent>;
    onTrimEmitter: EventEmitter<number, void>;
    get onTrim(): IEvent<number>;
    constructor(_maxLength: number);
    get maxLength(): number;
    set maxLength(newMaxLength: number);
    get length(): number;
    set length(newLength: number);
    get(index: number): T | undefined;
    set(index: number, value: T | undefined): void;
    push(value: T): void;
    recycle(): T;
    get isFull(): boolean;
    pop(): T | undefined;
    splice(start: number, deleteCount: number, ...items: T[]): void;
    trimStart(count: number): void;
    shiftElements(start: number, count: number, offset: number): void;
    private _getCyclicIndex;
}
//# sourceMappingURL=CircularList.d.ts.map