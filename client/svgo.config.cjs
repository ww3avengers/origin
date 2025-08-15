module.exports = {
  multipass: true,
  plugins: [
    { name: 'preset-default' },
    { name: 'removeViewBox', active: false },
    { name: 'removeDimensions', active: false },
    { name: 'convertColors', params: { currentColor: false } },
    { name: 'cleanupIds', active: true },
    { name: 'removeDesc', active: true },
    { name: 'removeTitle', active: false },
  ],
};
