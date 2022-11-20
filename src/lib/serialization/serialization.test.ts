import { expect, test } from "vitest";

import {
    serialize,
    deserialize,
    serializeUint32,
    deserializeUint32,
    deserializeUint8,
    serializeUint8,
    serializeString,
    deserializeString,
    createArraySerializer,
    createArrayDeserializer,
    createObjectDeserializer,
    createObjectSerializer,
    serializeFloat64,
    deserializeFloat64,
    serializeVarUint,
    deserializeVarUint,
} from "./serialization";

test("Serialize and deserialize UInt32", () => {
    const value = 42;

    const serialized = serialize(serializeUint32, value);
    const deserialized = deserialize(deserializeUint32, serialized);

    expect(deserialized).toBe(value);
});

test("Serialize and deserialize UInt8", () => {
    const value = 42;

    const serialized = serialize(serializeUint8, value);
    const deserialized = deserialize(deserializeUint8, serialized);

    expect(deserialized).toBe(value);
});

test("Serialize and deserialize string", () => {
    const value = "Hello, world!";

    const serialized = serialize(serializeString, value);
    const deserialized = deserialize(deserializeString, serialized);

    expect(deserialized).toBe(value);
});

test("Serialize and deserialize unicode string", () => {
    const value = "👋, world!";

    const serialized = serialize(serializeString, value);
    const deserialized = deserialize(deserializeString, serialized);

    expect(deserialized).toBe(value);
});

test("Serialize and deserialize empty string", () => {
    const value = "";

    const serialized = serialize(serializeString, value);
    const deserialized = deserialize(deserializeString, serialized);

    expect(deserialized).toBe(value);
});

test("Serialize and deserialize string with null character", () => {
    const value = "Hello, \0 world!";

    const serialized = serialize(serializeString, value);
    const deserialized = deserialize(deserializeString, serialized);

    expect(deserialized).toBe(value);
});

test("Serialize and deserialize Uint32 array", () => {
    const array = [42, 1337, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const serialized = serialize(createArraySerializer(serializeUint32), array);
    const deserialized = deserialize(
        createArrayDeserializer(deserializeUint32),
        serialized
    );

    expect(deserialized).toEqual(array);
});

test("Serialize and deserialize Uint8 array", () => {
    const array = [42, 13, 37, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const serialized = serialize(createArraySerializer(serializeUint8), array);
    const deserialized = deserialize(
        createArrayDeserializer(deserializeUint8),
        serialized
    );

    expect(deserialized).toEqual(array);
});

test("Serialize and deserialize string array", () => {
    const array = ["Hello", "world", "👋", "🌍"];

    const serialized = serialize(createArraySerializer(serializeString), array);
    const deserialized = deserialize(
        createArrayDeserializer(deserializeString),
        serialized
    );

    expect(deserialized).toEqual(array);
});

test("Serialize and deserialize float64 array", () => {
    const array = [42.2, 1337.4, 0.1, -1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const serialized = serialize(
        createArraySerializer(serializeFloat64),
        array
    );
    const deserialized = deserialize(
        createArrayDeserializer(deserializeFloat64),
        serialized
    );

    expect(deserialized).toEqual(array);
});

test("Serialize and deserialize string object", () => {
    const value = {
        a: "Hello, world!",
        b: "👋, world!",
        c: "",
        d: "Hello, \0 world!",
    };

    const serialized = serialize(
        createObjectSerializer(serializeString, serializeString),
        value
    );
    const deserialized = deserialize(
        createObjectDeserializer(deserializeString, deserializeString),
        serialized
    );

    expect(deserialized).toEqual(value);
});

test("Serialize and deserialize number object", () => {
    const value = {
        a: 42,
        b: 1337,
        c: 0,
        d: 1,
        e: 2,
        f: 3,
        g: 4,
        h: 5,
    };

    const serialized = serialize(
        createObjectSerializer(serializeString, serializeUint32),
        value
    );
    const deserialized = deserialize(
        createObjectDeserializer(deserializeString, deserializeUint32),
        serialized
    );

    expect(deserialized).toEqual(value);
});

test("Serialize and deserialize object in object", () => {
    const value = {
        a: {
            b: 42,
            c: 1337,
        },
        d: {
            e: 0,
            f: 1,
        },
    };

    const serialized = serialize(
        createObjectSerializer(
            serializeString,
            createObjectSerializer(serializeString, serializeUint32)
        ),
        value
    );
    const deserialized = deserialize(
        createObjectDeserializer(
            deserializeString,
            createObjectDeserializer(deserializeString, deserializeUint32)
        ),
        serialized
    );

    expect(deserialized).toEqual(value);
});

test("Serialize and deserialize varUint", () => {
    const value = 42;

    const serialized = serialize(serializeVarUint, value);
    const deserialized = deserialize(deserializeVarUint, serialized);

    expect(deserialized).toBe(value);
});
