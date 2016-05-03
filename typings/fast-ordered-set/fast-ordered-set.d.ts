
interface Set<T> {
    add(value: T): Set<T>;
    clear(): void;
    delete(value: T): boolean;
    entries(): Array<[T, T]>;
    forEach(callbackfn: (value: T, index: T, set: Set<T>) => void, thisArg?: any): void;
    has(value: T): boolean;
    keys(): Array<T>;
}

interface SetConstructor {
    new <T>(): Set<T>;
    new <T>(iterable: Array<T>): Set<T>;
}

declare var Set: SetConstructor;

declare module "fast-ordered-set" {
  export = Set;
}
