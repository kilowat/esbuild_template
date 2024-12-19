import { BuildWhen, Cubit, ListenWhen, StateListener } from "./cubit";

export function Consumer<T>({
    cubit,
    element,
    build,
    buildWhen,
    listener,
    listenWhen,
}: {
    cubit: Cubit<T>;
    listener?: StateListener<Readonly<T>>;
    element?: HTMLElement;
    build?: (state: { state: Readonly<T> }) => unknown;
    buildWhen?: BuildWhen<Readonly<T>>;
    listenWhen?: ListenWhen<Readonly<T>>;
}): () => void {
    return cubit['_subscribe'](
        listener,
        build,
        element,
        buildWhen,
        listenWhen,
    );
}