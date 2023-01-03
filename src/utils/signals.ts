import { createSignal, Signal } from "solid-js";

export function createStoredSignal<T>(
    key: string,
    defaultValue: T,
    storage = localStorage
): Signal<T> {
    const partialInitialValue = storage.getItem(key)
        ? (JSON.parse(storage.getItem(key)!) as Partial<T>)
        : defaultValue;
    const initialValue: T = { ...defaultValue, ...partialInitialValue };

    const [value, setValue] = createSignal<T>(initialValue);

    const setValueAndStore = ((arg) => {
        const v = setValue(arg);
        storage.setItem(key, JSON.stringify(v));
        return v;
    }) as typeof setValue;

    return [value, setValueAndStore];
}
