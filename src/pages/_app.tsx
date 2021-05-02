import React from "react";

import { AppProps } from "next/app";
import Head from "next/head";

import "destyle.css";
import "../styles/main.scss";

const App = ({ Component, pageProps }: AppProps): React.ReactElement => (
  <>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </Head>
    <Component {...pageProps} />
  </>
);

export default App;
