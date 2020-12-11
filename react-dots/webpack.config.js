const HtmlWebPackPlugin = require( 'html-webpack-plugin' );
const path = require( 'path' );
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
   context: __dirname,
   entry: './src/index.jsx',
   output: {
      path: path.resolve( __dirname, 'dist' ),
      filename: 'main.js',
      publicPath: '/',
   },

   devServer: {
      historyApiFallback: true,
      proxy: {
         "/api": "http://localhost:8000"
      }
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
      ]
   },
   resolve: {
      extensions: ['.js', '.jsx']
    },
   plugins: [
      new HtmlWebPackPlugin({
         template: path.resolve( __dirname, 'public/index.html' ),
         filename: 'index.html'
      }), 
      new ESLintPlugin()
   ],
   watchOptions: {
      ignored: "/node_modules/"
    }
};