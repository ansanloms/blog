import util from "util";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type PostContent = {
  readonly title: string;
  readonly slug: string;
  readonly date: string;
  readonly content: string;
};

const postsDirectory = path.join(process.cwd(), "content/posts");

export const getPosts = async (slug?: string): Promise<PostContent[]> => {
  const list: PostContent[] = await Promise.all(
    (
      await util.promisify(fs.readdir)(postsDirectory)
    )
      .filter(
        (it) =>
          it.endsWith(".md") &&
          (typeof slug === "undefined" ? true : it === `${slug}.md`)
      )
      .map(async (file) => {
        const content = matter(
          await util.promisify(fs.readFile)(
            path.join(postsDirectory, file),
            "utf8"
          )
        );

        return {
          title: content.data.title,
          slug: path.basename(file, ".md"),
          date: content.data.date,
          content: content.content,
        };
      })
  );

  list.sort((a: PostContent, b: PostContent) => {
    const aDate = new Date(a.date);
    const bDate = new Date(b.date);

    if (aDate > bDate) {
      return -1;
    } else if (aDate < bDate) {
      return 1;
    } else {
      return 0;
    }
  });

  return list;
};
