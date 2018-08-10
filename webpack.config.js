const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'development',
  target: 'node'
};
