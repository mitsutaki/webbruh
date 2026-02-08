
/// <reference types="vitest" />

import { mergeConfig } from 'vite'
import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config.mts'

export default mergeConfig(viteConfig, defineConfig({
    test: {
        environment: 'jsdom',
        exclude: ['**/node_modules/**', '**/dist/**'],
        root: './',
        globals: true, // Enable global text/expect
    }
}))
