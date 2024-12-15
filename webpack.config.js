const path = require('path');

module.exports = {
  entry: './src/index.js', // Your entry JavaScript file
  output: {
    filename: 'bundle.js', // Output file name
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  mode: 'development', // Use development mode for faster builds
  watch: true, // Enable watch mode for rebuilding on save
  devServer: {
    static: './dist', // Serve files from the "dist" directory
    hot: true, // Enable Hot Module Replacement (HMR)
  },
};
