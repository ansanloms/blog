module.exports = {
  future: {
    webpack5: true,
  },

  env: {
    TITLE: "ansanloms blog",
    DESCRIPTION: "備忘録まとめ",
    AUTHOR: "ansanloms",
    URL: "https://ansanloms.github.io/blog",
    TRACKING_ID: "G-7RDLMRRRDG",
  },

  basePath: "/blog",

  webpack: (config, {}) => {
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg)$/i,
      use: {
        loader: "file-loader",
        options: {
          outputPath: "static/images/",
          publicPath: "/_next/static/images",
        },
      },
    });

    return config;
  },
};
