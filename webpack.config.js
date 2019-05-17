const path = require('path');

module.exports = {
  entry: "./src/index.js",

  output: {
      filename: "bundle.js",
      libraryTarget: 'commonjs',
      path: path.resolve(__dirname, 'dist')
  },
  target: 'node',
  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
      // Add '.ts' and '.tsx' as resolvable extensions.
      extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
  },

  module: {
      rules: [
          // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
          { test: /\.tsx?$/, loader: "awesome-typescript-loader" }
      ],
  },

  // Other options...
};
