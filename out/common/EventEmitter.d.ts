import { IDisposable } from './Types';
export interface IEvent<T, U = void> {
    (listener: (arg1: T, arg2: U) => any): IDisposable;
}
export interface IEventEmitter<T, U = void> {
    event: IEvent<T, U>;
    fire(arg1: T, arg2: U): void;
    dispose(): void;
}
export declare class EventEmitter<T, U = void> implements IEventEmitter<T, U> {
    private _listeners;
    private _event?;
    private _disposed;
    get event(): IEvent<T, U>;
    fire(arg1: T, arg2: U): void;
    dispose(): void;
}
export declare function forwardEvent<T>(from: IEvent<T>, to: IEventEmitter<T>): IDisposable;
//# sourceMappingURL=EventEmitter.d.ts.map