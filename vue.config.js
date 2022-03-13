module.exports = {
  runtimeCompiler: true,
  publicPath: process.env.NODE_ENV === "production" ? "./" : "/",
  pages: {
    index: {
      entry: "./src/home/main.js",
      template: "index.html",
      filename: "index.html",
      name: "Twitch Multi Chat",
    },
    join: {
      entry: "./src/join/main.js",
      template: "index.html",
      filename: "join.html",
      name: "Join Channel",
    },
  },
};
