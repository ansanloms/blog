import lume from "lume/mod.ts";

import basePath from "lume/plugins/base_path.ts";
import jsx from "lume/plugins/jsx_preact.ts";
import sass from "lume/plugins/sass.ts";
import metas from "lume/plugins/metas.ts";
import codeHighlight from "lume/plugins/code_highlight.ts";
import plantuml from "lume-plugin-plantuml/mod.ts";
import mermaid from "./_includes/plugins/mermaid.ts";

const site = lume({
  location: new URL("https://ansanloms.github.io/blog"),
});

site.ignore("README.md");

site.use(basePath());
site.use(jsx());
site.use(sass());
site.use(metas());
site.use(codeHighlight());
site.use(plantuml({
  binary: {
    version: "v1.2023.6",
    dest: "./_bin/plantuml.jar",
    checksum:
      "bf2dee10750fd1794ad9eac7de020064d113838ec169448a16b639dbfb67617d",
  },
}));
site.use(mermaid());

site.copy("assets");

export default site;
