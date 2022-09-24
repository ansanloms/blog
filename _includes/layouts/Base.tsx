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
