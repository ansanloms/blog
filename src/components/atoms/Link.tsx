import React from "react";

import NextLink from "next/link";
import ExternalLink from "./ExternalLink";

const Link: React.FC<{
  href: string;
  target?: string;
  children?: string;
}> = ({ href, target, children }) => {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return (
      <ExternalLink href={href} target={target || "_blank"}>
        {children}
      </ExternalLink>
    );
  } else {
    return <NextLink href={href}>{children}</NextLink>;
  }
};

export default Link;
