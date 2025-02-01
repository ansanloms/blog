import lume from "lume/mod.ts";
import blog from "lume-theme-blog/mod.ts";

const site = lume({
  src: "./docs",
  location: new URL("https://ansanloms.github.io/blog"),
});

site
  .use(blog({
    markdown: {
      syntaxHighlight: {
        themes: { light: "nord", dark: "nord" },
      },
    },
  }))
  .copy("assets");

export default site;
