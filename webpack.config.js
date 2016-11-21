var nodeExternals = require('webpack-node-externals');

module.exports = {
  context: __dirname,
  node: {
    _dirname: false
  },
  entry: [
    "./routes.js",
    "./public/js/index.js",
    "./scrape.js"
  ],
  target: 'node',
  externals: [nodeExternals()],
  output: {
    path: __dirname + "/public/js",
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