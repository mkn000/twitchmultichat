module.exports = {
  runtimeCompiler: true,
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  pages: {
    index: {
      // entry for the page
      entry: 'src/main.js',
      title: 'Twitch Multi Chat',
    },
  },
};
