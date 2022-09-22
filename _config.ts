import lume from "lume/mod.ts";
import jsx_preact from "lume/plugins/jsx_preact.ts";
import prism from "lume/plugins/prism.ts";
import sass from "lume/plugins/sass.ts";

const site = lume();

site.ignore("README.md");

site.use(jsx_preact());
site.use(prism());
site.use(sass());

site.copy("assets");

export default site;
