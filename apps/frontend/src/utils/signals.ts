import { createSignal, Signal, SignalOptions } from "solid-js";

const isObject = (value: unknown): value is object =>
    typeof value === "object" &&
    !Array.isArray(value) &&
    value !== null &&
    value instanceof Set === false &&
    value instanceof Map === false;

export function createStoredSignal<T>(
    key: string,
    defaultValue: T,
    options?: SignalOptions<T>,
    storage = localStorage,
    serializer = JSON.stringify,
    deserializer = JSON.parse
): Signal<T> {
    const partialInitialValue = storage.getItem(key)
        ? (deserializer(storage.getItem(key)!) as Partial<T>)
        : defaultValue;

    // Spread the default value to ensure backwards compatibility for objects
    const initialValue: T = isObject(defaultValue)
        ? { ...defaultValue, ...partialInitialValue }
        : (partialInitialValue as T);

    const [value, setValue] = createSignal<T>(initialValue, options);

    const setValueAndStore = ((arg) => {
        const v = setValue(arg);
        storage.setItem(key, serializer(v));
        return v;
    }) as typeof setValue;

    return [value, setValueAndStore];
}
