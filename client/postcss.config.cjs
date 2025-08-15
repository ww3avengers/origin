module.exports = {
  plugins: [
    // Wichtig: Tailwind MUSS vor preset-env laufen, damit @tailwind/@apply verstanden werden
    require('postcss-import'),
    require('tailwindcss'),
    require('autoprefixer'),
    require('postcss-preset-env'),
  ],
};
