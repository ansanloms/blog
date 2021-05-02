import React from "react";
import Head from "next/head";

import Header from "./Header";
import Footer from "./Footer";
import styles from "./Layout.module.scss";

const Layout: React.FC<{
  children?: React.ReactNode;
  title?: string;
}> = ({ children, title = null }) => (
  <>
    <Head>
      <title>
        {title && `${title} - `}
        {process.env.TITLE}
      </title>
    </Head>
    <div className={styles.container}>
      <Header />
      <article className={styles.content}>{children}</article>
      <Footer />
    </div>
  </>
);

export default Layout;
