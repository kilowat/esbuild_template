import { useCubit } from "../utils/useCubit";

export const counterCubit = useCubit({ state: 0 });

export const increment = () => { counterCubit.emit(counterCubit.state + 1) };