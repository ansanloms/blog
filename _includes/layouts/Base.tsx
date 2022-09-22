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
      <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js">
      </script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css" />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/ress@5.0.2/dist/ress.min.css"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100;300;400;500;700;900&display=swap"
      />
      <link rel="stylesheet" href="/styles/main.css" />
      <link
        rel="stylesheet"
        href={`/styles/${props.layout}.css`}
      />
    </head>
    <body>
      <header>
        <a href="/">ansanloms blog</a>
      </header>
      <div className="container">
        {props.children}
      </div>
      <footer>
        (C) <a href="https://twitter.com/ansanloms">ansanloms</a>
      </footer>
    </body>
  </html>
);
