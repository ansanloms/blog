import lume from "lume/mod.ts";

import basePath from "lume/plugins/base_path.ts";
import jsx from "lume/plugins/jsx_preact.ts";
import prism from "lume/plugins/prism.ts";
import sass from "lume/plugins/sass.ts";

const site = lume({
  location: new URL("https://ansanloms.github.io/blog"),
});

site.ignore("README.md");

site.use(basePath());
site.use(jsx());
site.use(prism());
site.use(sass());

site.copy("assets");

export default site;
