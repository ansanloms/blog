import React from "react";

import NextLink from "next/link";

const Link: React.FC<{
  href: string;
  children?: string;
}> = ({ href, children }) => <NextLink href={href}>{children}</NextLink>;

export default Link;
