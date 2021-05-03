import React from "react";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

const Code: React.FC<{
  identifier?: string;
  children?: string;
}> = ({ identifier, children }) => {
  if (children && /\n/g.test(children)) {
    const match = (/language-(.+)/.exec(identifier || "") || ["", ""])[1].split(
      ":"
    );
    const language = match[0] || "";
    // const filename = match[1] || "";
    // const startingLineNumber = /^[0-9]+$/.test(match[2]) && Number(match[2]) > 0 ? Number(match[2]) : 1;

    return (
      <SyntaxHighlighter style={atomDark} language={language}>
        {children.trimEnd()}
      </SyntaxHighlighter>
    );
  } else {
    return <code>{children}</code>;
  }
};

export default Code;
