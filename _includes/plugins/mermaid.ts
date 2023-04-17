import { merge } from "lume/core/utils.ts";
import type { Site } from "lume/core.ts";

export interface Options {
  extensions: string[];
  cssSelector: string;
}

export const defaults: Options = {
  extensions: [".html"],
  cssSelector: "pre code.language-mermaid",
};

export default function (userOptions?: Partial<Options>) {
  const options = merge(defaults, userOptions);

  return (site: Site) => {
    site.process(options.extensions, (page) => {
      const script = page.document!.createElement("script");
      script.setAttribute("type", "module");
      script.innerHTML = `
        import mermaid from 'https://unpkg.com/mermaid@9/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ startOnLoad: true });
      `;
      page.document!.head.appendChild(script);

      page.document!.querySelectorAll(options.cssSelector!).forEach(
        (element) => {
          const graph = element.textContent.trim();
          element.className = "mermaid";
          element.innerText = graph;
        },
      );
    });
  };
}
