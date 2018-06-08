var path = require('path');
module.exports = {
  entry: ['babel-polyfill', './src/components/TwilioConnectionManager.js'],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: './index.js',
    libraryTarget: 'commonjs2' // THIS IS THE MOST IMPORTANT LINE! :mindblow: I wasted more than 2 days until realize this was the line most important in all this guide.
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
        ],
      },
      {
        test: /\.(png|jp(e*)g|svg)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8000, // Convert images < 8kb to base64 strings
            name: 'images/[hash]-[name].[ext]'
          }
        }]
      }
    ]
  },
  externals: {
    react: {
      commonjs2: 'react',
      commonjs: 'react',
    },
    'react-dom': {
      commonjs2: 'react-dom',
      commonjs: 'react-dom',
    },
  }
};
