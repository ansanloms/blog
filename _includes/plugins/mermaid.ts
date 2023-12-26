import { mergeData } from "lume/core/utils/merge_data.ts";

export interface Options {
  extensions: string[];
  cssSelector: string;
}

export const defaults: Options = {
  extensions: [".html"],
  cssSelector: "pre code.language-mermaid",
};

export default function (userOptions?: Partial<Options>) {
  const options = mergeData(defaults, userOptions || {});

  return (site) => {
    site.process(options.extensions, (pages) => {
      for (const page of pages) {
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
      }
    });
  };
}
