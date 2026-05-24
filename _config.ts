import lume from "lume/mod.ts";
import blog from "lume-theme-blog/mod.ts";
import basePath from "lume/plugins/base_path.ts";

const site = lume({
  src: "./docs",
  location: new URL("https://ansanloms.github.io/blog"),
});

site
  .copy([".jpg", ".jpeg", ".gif", ".png", ".svg", ".webp", ".csv"])
  .use(basePath())
  .use(blog({
    /**
     * markdown の設定。
     */
    markdown: {
      /**
       * シンタックスハイライトの設定。
       */
      syntaxHighlight: {
        /**
         * シンタックスハイライトのテーマ。
         * Shiki(https://shiki.style/)のテーマを指定する。
         */
        themes: { light: "github-light", dark: "github-dark" },

        /**
         * ハイライト対象外の言語。
         */
        exclude: ["mermaid"],
      },
    },
  }));

export default site;
