import * as path from "std/path/mod.ts";
import * as datetime from "std/datetime/mod.ts";
import { Marked } from "markdown/mod.ts";

import Layout from "./_includes/layouts/Index.tsx";

const getArticles = async (): { slug: string; title: string; date: Date }[] => {
  const list: { slug: string; title: string; date: Date }[] = [];

  for await (const article of Deno.readDir("./articles")) {
    if (article.isFile && path.extname(article.name) === ".md") {
      const slug = path.basename(article.name, ".md");
      const md = await Deno.readTextFile(`./articles/${slug}.md`);
      const { meta } = Marked.parse(md);

      list.push({
        slug,
        title: typeof meta.title === "string" ? meta.title : slug,
        date: new Date(meta.date),
      });
    }
  }

  list.sort((a, b) => {
    if (a.date > b.date) {
      return -1;
    } else if (a.date < b.date) {
      return 1;
    } else {
      return 0;
    }
  });

  return list;
};

const index = async () => {
  const articles = (await getArticles()).map((v) => (
    <li key={v.slug}>
      <p className="date">
        {datetime.format(v.date, "yyyy-MM-dd")}
      </p>
      <a href={`/articles/${v.slug}`}>
        {v.title}
      </a>
    </li>
  ));

  return (
    <Layout>
      <ul className="list">{articles}</ul>
    </Layout>
  );
};

export default index;
