export async function retry<T extends (...args: any) => any>(
    fn: T,
    retries = 5
): Promise<ReturnType<T>> {
    let error: unknown | undefined;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (e) {
            console.log("Retrying, error:", e);
            error = e;
        }
    }

    throw error;
}
