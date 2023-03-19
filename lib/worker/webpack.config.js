// webpack.config.js

module.exports = {
  mode: 'production',
  entry: './index.js',
  resolve: {
    extensions: ['.js']
  },
  output: {
    filename: 'worker.dist.js',
    path: require('path').resolve(__dirname, 'dist')
  }
};
