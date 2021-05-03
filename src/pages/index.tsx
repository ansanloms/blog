import React from "react";
import { NextPage, GetStaticProps } from "next";
import Link from "next/link";

import { getPosts, PostContent } from "../libraries/posts";
import Layout from "../components/templates/Layout";

import dayjs from "dayjs";

const Index: NextPage<{ posts: PostContent[] }> = ({ posts }) => {
  const list = [];
  for (const post of posts) {
    list.push(
      <li key={post.slug}>
        {dayjs(post.date).format("YYYY.MM.DD")} -{" "}
        <Link href={`/articles/${post.slug}`}>{post.title}</Link>
      </li>
    );
  }

  return (
    <Layout>
      <section>
        <ul>{list}</ul>
      </section>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async () => ({
  props: {
    posts: await getPosts(),
  },
});

export default Index;
