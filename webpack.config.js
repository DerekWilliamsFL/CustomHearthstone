var nodeExternals = require('webpack-node-externals');

module.exports = {
  context: __dirname,
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  entry: [
    "./routes.js",
    "./scrape.js"
  ],
  externals: [nodeExternals()],
  output: {
    path: __dirname,
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