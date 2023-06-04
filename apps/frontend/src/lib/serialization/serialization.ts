const MAX_BYTES = 1024 * 1024 * 64; // 64 MB

export interface SerializationContext {
    offset: number;
    dataView: DataView;
}

export interface DeserializationContext {
    offset: number;
    dataView: DataView;
}

export type Serializer<T> = (ctx: SerializationContext, value: T) => void;
export type Deserializer<T> = (ctx: DeserializationContext) => T;

export function serialize<T>(
    serializer: Serializer<T>,
    value: T,
    maxBytes = MAX_BYTES
): ArrayBuffer {
    const dataView = new DataView(new ArrayBuffer(maxBytes));
    const ctx = {
        offset: 0,
        dataView,
    };
    serializer(ctx, value);
    return dataView.buffer.slice(0, ctx.offset);
}

export function deserialize<T>(
    deserializer: Deserializer<T>,
    buffer: ArrayBuffer
): T {
    const dataView = new DataView(buffer);
    const ctx = {
        offset: 0,
        dataView,
    };
    return deserializer(ctx);
}

export function serializeVarUint(ctx: SerializationContext, value: number) {
    while (value > 127) {
        ctx.dataView.setUint8(ctx.offset, (value & 0x7f) | 0x80);
        ctx.offset += 1;
        value >>>= 7;
    }
    ctx.dataView.setUint8(ctx.offset++, value);
}

export function deserializeVarUint(ctx: DeserializationContext): number {
    let value = 0;
    let shift = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const byte = ctx.dataView.getUint8(ctx.offset);
        ctx.offset += 1;
        value |= (byte & 0x7f) << shift;
        if (byte < 128) {
            return value;
        }
        shift += 7;
    }
}

export function serializeUint32(ctx: SerializationContext, value: number) {
    ctx.dataView.setUint32(ctx.offset, value);
    ctx.offset += 4;
}

export function deserializeUint32(ctx: DeserializationContext): number {
    const value = ctx.dataView.getUint32(ctx.offset);
    ctx.offset += 4;
    return value;
}

export function serializeUint8(ctx: SerializationContext, value: number) {
    ctx.dataView.setUint8(ctx.offset, value);
    ctx.offset += 1;
}

export function deserializeUint8(ctx: DeserializationContext): number {
    const value = ctx.dataView.getUint8(ctx.offset);
    ctx.offset += 1;
    return value;
}

export function serializeFloat64(ctx: SerializationContext, value: number) {
    ctx.dataView.setFloat64(ctx.offset, value);
    ctx.offset += 8;
}

export function deserializeFloat64(ctx: DeserializationContext): number {
    const value = ctx.dataView.getFloat64(ctx.offset);
    ctx.offset += 8;
    return value;
}

export function serializeString(ctx: SerializationContext, value: string) {
    const bytes = new TextEncoder().encode(value);
    serializeVarUint(ctx, bytes.length);

    const view = new Uint8Array(ctx.dataView.buffer, ctx.offset, bytes.length);
    view.set(bytes);

    ctx.offset += bytes.length;
}

export function deserializeString(ctx: DeserializationContext): string {
    const bytes = deserializeVarUint(ctx);

    const decoder = new TextDecoder();
    const string = decoder.decode(
        ctx.dataView.buffer.slice(ctx.offset, ctx.offset + bytes)
    );
    ctx.offset += bytes;

    return string;
}

export function serializeObject<TKey extends string | number | symbol, TValue>(
    ctx: SerializationContext,
    keySerializer: Serializer<TKey>,
    valueSerializer: Serializer<TValue>,
    object: Record<TKey, TValue>
): number {
    const size = Object.keys(object).length;
    serializeUint32(ctx, size);

    for (const [key, value] of Object.entries<TValue>(object)) {
        keySerializer(ctx, key as TKey);
        valueSerializer(ctx, value);
    }

    return size;
}

export function deserializeObject<
    TKey extends string | number | symbol,
    TValue
>(
    ctx: DeserializationContext,
    keyDeserializer: Deserializer<TKey>,
    valueDeserializer: Deserializer<TValue>
): Record<TKey, TValue> {
    const size = deserializeUint32(ctx);

    const object: Record<TKey, TValue> = {} as Record<TKey, TValue>;
    for (let i = 0; i < size; i++) {
        const key = keyDeserializer(ctx);
        const value = valueDeserializer(ctx);

        object[key] = value;
    }

    return object;
}

export function createObjectSerializer<
    TKey extends string | number | symbol,
    TValue
>(
    keySerializer: Serializer<TKey>,
    valueSerializer: Serializer<TValue>
): Serializer<Record<TKey, TValue>> {
    return (ctx, value) =>
        serializeObject(ctx, keySerializer, valueSerializer, value);
}

export function createObjectDeserializer<
    TKey extends string | number | symbol,
    TValue
>(
    keyDeserializer: Deserializer<TKey>,
    valueDeserializer: Deserializer<TValue>
): Deserializer<Record<TKey, TValue>> {
    return (ctx) => deserializeObject(ctx, keyDeserializer, valueDeserializer);
}

export function serializeArray<T>(
    ctx: SerializationContext,
    serializer: Serializer<T>,
    array: T[]
) {
    serializeUint32(ctx, array.length);

    for (const element of array) {
        serializer(ctx, element);
    }
}

export function createArraySerializer<T>(
    serializer: Serializer<T>
): Serializer<T[]> {
    return (ctx, array) => serializeArray(ctx, serializer, array);
}

export function deserializeArray<T>(
    ctx: DeserializationContext,
    deserializer: Deserializer<T>
): T[] {
    const size = deserializeUint32(ctx);

    const array: T[] = [];
    for (let i = 0; i < size; i++) {
        const element = deserializer(ctx);
        array.push(element);
    }

    return array;
}

export function createArrayDeserializer<T>(
    deserializer: Deserializer<T>
): Deserializer<T[]> {
    return (ctx) => deserializeArray(ctx, deserializer);
}
