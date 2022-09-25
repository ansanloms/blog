import Header from "../Header.tsx";
import Footer from "../Footer.tsx";

type Props = {
  title: string;
  layout: string;
  children: Node;
};

export default (props: Props) => (
  <html lang="ja">
    <head>
      <meta charSet="UTF-8" />
      <meta
        name="viewport"
        content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
      />
      <title>{props.title}</title>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/highlight.js@11.6.0/styles/obsidian.css"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/ress@5.0.2/dist/ress.min.css"
      />
      <link rel="stylesheet" href="/styles/main.css" />
      <link
        rel="stylesheet"
        href={`/styles/${props.layout}.css`}
      />
    </head>
    <body>
      <Header />
      <div className="content">
        {props.children}
      </div>
      <Footer />
    </body>
  </html>
);
