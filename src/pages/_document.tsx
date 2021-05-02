import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";

/**
 *
 */
export default class CustomDocument extends Document {
  /**
   * @return {React.ReactElement}
   */
  render(): React.ReactElement {
    return (
      <Html lang="ja-JP">
        <Head>
          <meta charSet="UTF-8" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="description" content={process.env.DESCRIPTION} />
          <meta name="author" content={process.env.AUTHOR} />
          <link rel="canonical" href={process.env.URL} />

          <meta property="og:site_name" content={process.env.TITLE} />
          <meta property="og:title" content={process.env.TITLE} />
          <meta property="og:description" content={process.env.DESCRIPTION} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={process.env.URL} />

          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.TRACKING_ID}`}
          ></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.TRACKING_ID}');
              `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
