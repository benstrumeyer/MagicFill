const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    content: './extension/src/content/content.ts',
    background: './extension/src/background/background.ts',
    popup: './extension/src/popup/popup.ts'
  },
  output: {
    path: path.resolve(__dirname, 'extension/dist'),
    filename: '[name].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@shared': path.resolve(__dirname, 'shared')
    }
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'extension/manifest.json', to: 'manifest.json' },
        { from: 'extension/src/popup/popup.html', to: 'popup.html' },
        { from: 'extension/src/popup/popup.css', to: 'popup.css' }
      ]
    })
  ],
  devtool: 'source-map'
};
