module.exports = {
  multipass: true,
  plugins: [
    { name: 'preset-default' },
    // Behalte viewBox für responsives Scaling
    { name: 'removeViewBox', active: false },
    // Entferne keine dimensionen automatisch, Logos sind vielseitig genutzt
    { name: 'removeDimensions', active: false },
    // Vereinheitliche Farbdefinitionen
    { name: 'convertColors', params: { currentColor: false } },
    // Entferne unnötige IDs/Kommentare
    { name: 'cleanupIDs', active: true },
    { name: 'removeDesc', active: true },
    { name: 'removeTitle', active: false }, // Title kann für A11y nützlich sein
  ],
};
