import { html, render } from "lit-html/lit-html";
import { createWebComponent } from "../utils/component"; // Assuming the previous component is in this file
import { useCubit, Cubit, consumer } from "../utils/useCubit"; // Assuming the cubit implementation is in this file

interface ThemeState {
    theme: 'light' | 'dark';
}

const themeCubit = useCubit<ThemeState['theme']>({ state: 'light' });

// Main application component
export const MainApp = createWebComponent('main-app', {
    connect(element) {

    },
});

export const GlobalCubits = {
    themeCubit,
};