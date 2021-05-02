import React from "react";
import Link from "next/link";

import styles from "./Header.module.scss";

const navigations: { title: string; href: string }[] = [
  {
    title: "Blog",
    href: "/",
  },
  {
    title: "Twitter",
    href: "https://twitter.com/ansanloms",
  },
];

const Header: React.FC = () => {
  const list = [];
  for (const nav of navigations) {
    list.push(
      <li key={nav.href}>
        <Link href={nav.href}>{nav.title}</Link>
      </li>
    );
  }

  return (
    <header className={styles.container}>
      <h1 className={styles.title}>
        {process.env.TITLE}
        <span>{process.env.DESCRIPTION}</span>
      </h1>
      <section className={styles.navigation}>
        <nav>
          <ul>{list}</ul>
        </nav>
      </section>
    </header>
  );
};

export default Header;
