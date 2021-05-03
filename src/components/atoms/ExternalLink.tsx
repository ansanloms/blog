import React from "react";

const ExternalLink: React.FC<{
  href: string;
  target?: string;
  children?: string;
}> = ({ href, target, children }) => {
  const props = {
    href: href,
  };

  if (target) {
    props.target = target;
    props.rel = "noopener noreferrer";
  }

  return <a {...props}>{children}</a>;
};

export default ExternalLink;
