import { merge } from "lume/core/utils.ts";
import type { Page, Site } from "lume/core.ts";
import plantumlEncoder from "plantuml-encoder";

export interface Options {
  extensions: string[];
  cssSelector: string;
  generate: (uml: string, page: Page) => Element;
}

export const defaults: Options = {
  extensions: [".html"],
  cssSelector: "pre code.language-plantuml",
  generate: (uml, page) => {
    const img = page.document!.createElement("img");
    img.setAttribute(
      "src",
      `https://www.plantuml.com/plantuml/svg/${plantumlEncoder.encode(uml)}`,
    );
    return img;
  },
};

export default function (userOptions?: Partial<Options>) {
  const options = merge(defaults, userOptions);

  return (site: Site) => {
    site.process(options.extensions, (page) => {
      page.document!.querySelectorAll(options.cssSelector!).forEach(
        (element) => {
          element.replaceChild(
            options.generate(element.textContent.trim(), page),
            element.firstChild,
          );
        },
      );
    });
  };
}
