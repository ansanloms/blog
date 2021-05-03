import React from "react";
import path from "path";

const PostImage: React.FC<{
  src?: string;
  alt?: string;
}> = ({ src, alt }) => {
  let newSrc = src || "";

  if (!newSrc.startsWith("http://") && !newSrc.startsWith("https://")) {
    const images: { [key in string]: string } = {};
    const r = require.context(
      "../../../content/posts/images/",
      true,
      /\.(png|jpe?g|gif|svg)$/i
    );
    r.keys().map((item) => {
      images[item.replace("./", "")] = r(item).default;
    });

    const srcPath = path.resolve(newSrc).slice("/images/".length);
    newSrc =
      srcPath !== "" && typeof images[srcPath] !== "undefined"
        ? images[srcPath]
        : "";
  }

  return newSrc ? <img src={newSrc} alt={alt} /> : <span />;
};

export default PostImage;
