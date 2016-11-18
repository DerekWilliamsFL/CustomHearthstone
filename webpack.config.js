var nodeExternals = require('webpack-node-externals');

module.exports = {
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