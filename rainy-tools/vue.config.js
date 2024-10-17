// rainy-tools/vue.config.js
module.exports = {
    publicPath: process.env.NODE_ENV === 'production'
      ? '/salmonrain.github.io/'
      : '/'
  }