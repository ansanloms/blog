import lume from "lume/mod.ts";

import basePath from "lume/plugins/base_path.ts";
import jsx from "lume/plugins/jsx_preact.ts";
import sass from "lume/plugins/sass.ts";
import metas from "lume/plugins/metas.ts";
import codeHighlight from "lume/plugins/code_highlight.ts";

const site = lume({
  location: new URL("https://ansanloms.github.io/blog"),
});

site.ignore("README.md");

site.use(basePath());
site.use(jsx());
site.use(sass());
site.use(metas());
site.use(codeHighlight());

site.copy("assets");

export default site;
