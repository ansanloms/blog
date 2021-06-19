import React from "react";

import NextLink, { LinkProps } from "next/link";
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
    const props: React.PropsWithChildren<LinkProps> = {
      href: href,
    };

    if (href.startsWith("/articles/")) {
      <ExternalLink href={"/blog" + href}>{children}</ExternalLink>;
    }

    return <NextLink {...props}>{children}</NextLink>;
  }
};

export default Link;
