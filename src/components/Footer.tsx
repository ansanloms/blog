import React from "react";
import Link from "next/link";

import styles from "./Footer.module.scss";

const Footer: React.FC = () => (
  <footer className={styles.container}>
    <p>
      (C) 2021{" "}
      <Link href={`https://twitter.com/${process.env.AUTHOR}`}>
        {process.env.AUTHOR}
      </Link>
    </p>
    <p>
      このサイトでは{" "}
      <Link href="https://policies.google.com/technologies/partner-sites">
        Google Analytics
      </Link>{" "}
      を使用しています。
    </p>
  </footer>
);

export default Footer;
