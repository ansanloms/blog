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
      <header className="header">
        <a href="/">ansanloms blog</a>
      </header>
      <div className="content">
        {props.children}
      </div>
      <footer className="footer">
        (C) <a href="https://twitter.com/ansanloms">ansanloms</a>
      </footer>
    </body>
  </html>
);
