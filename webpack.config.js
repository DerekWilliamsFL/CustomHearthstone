var nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: [
    "./index.js",
    "./scrape.js"
  ],
  target: 'node',
  externals: [nodeExternals()],
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
};