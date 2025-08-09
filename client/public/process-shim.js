// Define process global for browser environment
window.process = {
  env: {
    NODE_ENV: 'development',
    VITE_APP_TITLE: 'LibreChat'
  },
  platform: 'browser',
  browser: true,
  version: ''
};

// Log that the shim is loaded
console.log('Process shim loaded');
