import { getCurrentColorScheme } from "./color-scheme.mjs";

/**
 * @typedef {{ name: string, url: string }} Icon
 * @typedef {{ enable: boolean, wheel?: boolean | ("ctrl" | "meta")[], aspectRatio?: string, maxWidth?: string, maxHeight?: string }} Zoom
 * @typedef {(querySelector: string, zoom?: Zoom) => void} EnableZoom
 * @typedef {(querySelector: string) => void} EnableCopy
 * @typedef {{ mermaid: Object, config: { light: Object, dark: Object }, icons: Icon[], querySelector: string, zoom: Zoom, enableZoom: EnableZoom, enableCopy: EnableCopy }} Options
 */

/**
 * mermaid で描画し、描画できた図にズーム・コピーを付与する。
 *
 * @param {Options} options
 */
const render = async (options) => {
  const { mermaid, querySelector, zoom, enableZoom, enableCopy } = options;

  try {
    // 壊れた図が含まれていても例外で停止させず、描画できた図はすべて処理する。
    await mermaid.run({ querySelector, suppressErrors: true });
  } finally {
    enableZoom(querySelector, zoom);
    enableCopy(querySelector);
  }
};

/**
 * @param {Options} options
 */
export const run = async (options) => {
  globalThis.__MERMAID = options;
  const { mermaid, config, icons, querySelector } = options;

  mermaid.registerIconPacks(
    icons.map(({ name, url }) => ({
      name,
      loader: () => fetch(url).then((res) => res.json()),
    })),
  );

  mermaid.initialize({
    ...config[getCurrentColorScheme()],
    startOnLoad: false,
  });

  // mermaid.run は対象要素の中身を SVG に差し替え、元コードを破棄する。
  // コピー機能と再描画で使うため、描画前に各要素の元コードを退避しておく。
  for (const target of document.querySelectorAll(querySelector)) {
    if (target.dataset.mermaidSource === undefined) {
      target.dataset.mermaidSource = target.textContent;
    }
  }

  await render(options);
};

globalThis.addEventListener("changeColorScheme", async (event) => {
  if (!globalThis.__MERMAID) {
    return;
  }

  /** @type Options */
  const options = globalThis.__MERMAID;

  const { mermaid, config, querySelector } = options;

  mermaid.initialize({
    ...config[event.detail.colorScheme],
    startOnLoad: false,
  });

  // 要素の中身を元コードへ戻す。ズームのラッパ・ツールバー・SVG はまとめて
  // 破棄されるため、render で付与し直しても二重に包まれない。
  for (const target of document.querySelectorAll(querySelector)) {
    if (target.dataset.mermaidSource === undefined) {
      continue;
    }
    delete target.dataset.processed;
    target.textContent = target.dataset.mermaidSource;
  }

  await render(options);
});
