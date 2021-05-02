import React from "react";

import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import raw from "rehype-raw";

import styles from "./Markdown.module.scss";

import Code from "./Code";
import Image from "./Image";
import Link from "./Link";

const Markdown: React.FC<{
  markdown: string;
}> = ({ markdown }) => (
  <ReactMarkdown
    className={styles.container}
    plugins={[gfm]}
    rehypePlugins={[raw]}
    components={{
      code: ({ className, children }) => (
        <Code identifier={className as string}>
          {(children as string[])[0]}
        </Code>
      ),
      img: ({ src, alt }) => <Image src={src as string} alt={alt as string} />,
      a: ({ href, children }) => (
        <Link href={href as string}>{(children as string[])[0]}</Link>
      ),
    }}
  >
    {markdown}
  </ReactMarkdown>
);

export default Markdown;
