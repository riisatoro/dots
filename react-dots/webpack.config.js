import HtmlWebPackPlugin from 'html-webpack-plugin';
import { resolve as _resolve } from 'path';
import ESLintPlugin from 'eslint-webpack-plugin';
import Dotenv from 'dotenv-webpack';

const dotenv = new Dotenv();

export default ({
  context: __dirname,
  entry: './src/index.jsx',
  output: {
    path: _resolve(__dirname, 'dist'),
    filename: 'main.js',
    publicPath: '/',
  },
  devServer: {
    historyApiFallback: true,
    proxy: {
      '/api': 'http://127.0.0.1:8000/',
    },
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.env'],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: _resolve(__dirname, 'public/index.html'),
      filename: 'index.html',
    }),
    new ESLintPlugin(),
    dotenv,
  ],
  watchOptions: {
    ignored: '/node_modules/',
  },
});
