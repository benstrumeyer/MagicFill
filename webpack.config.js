const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    content: './extension/content/content.ts',
    background: './extension/background/background.ts',
    popup: './extension/popup/popup.ts',
    manage: './extension/manage/manage.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@shared': path.resolve(__dirname, 'shared'),
      '@core': path.resolve(__dirname, 'extension/core')
    }
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'extension/manifest.json', to: 'manifest.json' },
        { from: 'extension/popup/popup.html', to: 'popup.html' },
        { from: 'extension/popup/popup.css', to: 'popup.css' },
        { from: 'extension/manage/manage.html', to: 'manage.html' },
        { from: 'extension/manage/manage.css', to: 'manage.css' },
        { from: 'dev-data.json', to: 'dev-data.json', noErrorOnMissing: true }
      ]
    })
  ],
  devtool: 'source-map'
};
