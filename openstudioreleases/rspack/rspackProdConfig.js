const rspack = require('@rspack/core');
const path = require('path');
const { merge } = require('webpack-merge');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const rspackCommonConfig = require('./rspackCommonConfig');

const cwd = process.cwd();

/**
 * @type {import('@rspack/cli').Configuration}
 */
module.exports = merge(rspackCommonConfig, {
  output: {
    path: path.join(cwd, 'dist'),
    publicPath: '/',
    filename: 'app/static/js/[chunkhash].js',
    chunkFilename:
      'app/static/js/chunk-[id]-[chunkhash].js',
    assetModuleFilename: 'app/static/img/[hash][ext][query]',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new rspack.HtmlRspackPlugin({
      template: path.join(cwd, './src/index.html'),
      filename: 'app/index.html',
      publicPath: '/',
    }),
  ],
  optimization: {
    minimize: true,
  },
});
