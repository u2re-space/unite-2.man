/*
 * Dependency-free validator for the JSON Schema keywords used by CWSP fixtures.
 * This is test-only: runtime packet validation remains explicit TypeScript code.
 */

type Schema = boolean | Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sameJsonValue(left: unknown, right: unknown): boolean {
    return JSON.stringify(left) === JSON.stringify(right);
}

function resolveReference(root: Record<string, unknown>, reference: string): Schema {
    if (!reference.startsWith("#/")) {
        throw new Error(`Only local JSON Schema references are supported: ${reference}`);
    }

    let current: unknown = root;
    for (const rawSegment of reference.slice(2).split("/")) {
        const segment = rawSegment.replaceAll("~1", "/").replaceAll("~0", "~");
        if (!isRecord(current) || !Object.hasOwn(current, segment)) {
            throw new Error(`Unresolvable JSON Schema reference: ${reference}`);
        }
        current = current[segment];
    }
    if (typeof current !== "boolean" && !isRecord(current)) {
        throw new Error(`Referenced JSON Schema is invalid: ${reference}`);
    }
    return current;
}

function matchesType(value: unknown, type: string): boolean {
    switch (type) {
        case "array":
            return Array.isArray(value);
        case "boolean":
            return typeof value === "boolean";
        case "integer":
            return typeof value === "number" && Number.isSafeInteger(value);
        case "null":
            return value === null;
        case "number":
            return typeof value === "number" && Number.isFinite(value);
        case "object":
            return isRecord(value);
        case "string":
            return typeof value === "string";
        default:
            throw new Error(`Unsupported JSON Schema type in test validator: ${type}`);
    }
}

function validateNode(
    value: unknown,
    schema: Schema,
    root: Record<string, unknown>,
    path: string,
): string[] {
    if (schema === true) {
        return [];
    }
    if (schema === false) {
        return [`${path}: schema rejects every value`];
    }

    if (typeof schema.$ref === "string") {
        return validateNode(value, resolveReference(root, schema.$ref), root, path);
    }

    if (Array.isArray(schema.anyOf)) {
        const matches = schema.anyOf.some((candidate) => {
            if (typeof candidate !== "boolean" && !isRecord(candidate)) {
                throw new Error(`${path}: invalid anyOf schema`);
            }
            return validateNode(value, candidate, root, path).length === 0;
        });
        if (!matches) {
            return [`${path}: does not match anyOf`];
        }
    }

    if (Object.hasOwn(schema, "const") && !sameJsonValue(value, schema.const)) {
        return [`${path}: does not equal const`];
    }
    if (
        Array.isArray(schema.enum)
        && !schema.enum.some((candidate) => sameJsonValue(value, candidate))
    ) {
        return [`${path}: is not in enum`];
    }

    if (typeof schema.type === "string" && !matchesType(value, schema.type)) {
        return [`${path}: expected ${schema.type}`];
    }

    const errors: string[] = [];
    if (typeof value === "string") {
        if (typeof schema.minLength === "number" && value.length < schema.minLength) {
            errors.push(`${path}: shorter than minLength`);
        }
        if (
            typeof schema.pattern === "string"
            && !new RegExp(schema.pattern, "u").test(value)
        ) {
            errors.push(`${path}: does not match pattern`);
        }
    }
    if (typeof value === "number") {
        if (typeof schema.minimum === "number" && value < schema.minimum) {
            errors.push(`${path}: below minimum`);
        }
        if (typeof schema.maximum === "number" && value > schema.maximum) {
            errors.push(`${path}: above maximum`);
        }
    }
    if (Array.isArray(value)) {
        if (schema.uniqueItems === true) {
            const serialized = value.map((item) => JSON.stringify(item));
            if (new Set(serialized).size !== serialized.length) {
                errors.push(`${path}: array items are not unique`);
            }
        }
        if (typeof schema.items === "boolean" || isRecord(schema.items)) {
            value.forEach((item, index) => {
                errors.push(...validateNode(item, schema.items as Schema, root, `${path}[${index}]`));
            });
        }
    }
    if (isRecord(value)) {
        const required = Array.isArray(schema.required)
            ? schema.required.filter((field): field is string => typeof field === "string")
            : [];
        for (const field of required) {
            if (!Object.hasOwn(value, field)) {
                errors.push(`${path}.${field}: required property is missing`);
            }
        }

        const properties = isRecord(schema.properties) ? schema.properties : {};
        for (const [field, propertySchema] of Object.entries(properties)) {
            if (!Object.hasOwn(value, field)) {
                continue;
            }
            if (typeof propertySchema !== "boolean" && !isRecord(propertySchema)) {
                throw new Error(`${path}.${field}: invalid property schema`);
            }
            errors.push(
                ...validateNode(value[field], propertySchema, root, `${path}.${field}`),
            );
        }
        if (schema.additionalProperties === false) {
            for (const field of Object.keys(value)) {
                if (!Object.hasOwn(properties, field)) {
                    errors.push(`${path}.${field}: additional property is not allowed`);
                }
            }
        }
    }

    return errors;
}

export function validateJsonSchema(value: unknown, schema: unknown): string[] {
    if (!isRecord(schema)) {
        throw new Error("Root JSON Schema must be an object");
    }
    return validateNode(value, schema, schema, "$");
}
