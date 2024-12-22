// src/config.ts

import { RenderEngine } from "./consumers";

export interface LibraryConfig {
    renderer: RenderEngine;
}

function createConfigManager() {
    let config: LibraryConfig | null = null;

    function consumerInit(newConfig: LibraryConfig): void {
        if (config) {
            console.warn('Library is already initialized. Call reset() before reinitializing.');
            return;
        }
        config = newConfig;
    }

    function reset(): void {
        config = null;
    }

    function getRenderer(): RenderEngine {
        if (!config) {
            throw new Error('Library is not initialized. Call initialize() first.');
        }
        return config.renderer;
    }

    function isInitialized(): boolean {
        return config !== null;
    }

    return {
        consumerInit,
        reset,
        getRenderer,
        isInitialized
    };
}

export const {
    consumerInit,
    reset,
    getRenderer,
    isInitialized
} = createConfigManager();