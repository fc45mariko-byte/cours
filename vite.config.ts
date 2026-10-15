import { defineConfig } from 'vite';

export default defineConfig({
  root: 'app',
  base: './',
  esbuild: { jsx: 'automatic', jsxImportSource: 'preact' },
  build: { outDir: '../dist', emptyOutDir: true, assetsDir: 'assets' },
  server: { fs: { allow: ['..'] } },
  test: { root: '.', include: ['tests/unit/**/*.test.ts'], environment: 'node' },
} as any);
