const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './code/index.js',
  plugins: [new HtmlWebpackPlugin({
    template: './index.html',
  })],
  module: {
    rules: [
      {
        test: /\.html$/,
        use: ['html-loader'],
      },
    ],
  },
};
