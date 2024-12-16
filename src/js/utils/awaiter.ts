export function awaiter<T = void>(
    seconds: number,
    value?: T
): Promise<T> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(value!), seconds * 1000);
    });
}
