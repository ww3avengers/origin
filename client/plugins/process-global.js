import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/**
 * A Vite plugin that provides a minimal 'process' global for the browser.
 * This is a workaround for libraries that expect Node.js globals.
 */
export default function processGlobal() {
  return {
    name: 'process-global',
    config() {
      return {
        define: {
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
          'process.platform': JSON.stringify('browser'),
          'process.browser': true,
          'process.env': {},
        },
        resolve: {
          alias: {
            process: 'process/browser',
            stream: 'stream-browserify',
            util: 'util',
            buffer: 'buffer',
            path: 'path-browserify',
          },
        },
        optimizeDeps: {
          esbuildOptions: {
            define: {
              global: 'globalThis',
            },
          },
        },
      };
    },
  };
}
