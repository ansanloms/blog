import React from "react";

import { NextPage, GetStaticProps, GetStaticPaths } from "next";
import ErrorPage from "next/error";

import dayjs from "dayjs";

import { getPosts, PostContent } from "../../libraries/posts";
import Layout from "../../components/Layout";
import Markdown from "../../components/Markdown";

import styles from "./Article.module.scss";

const Article: NextPage<{
  post?: PostContent;
}> = ({ post }) => {
  if (!post) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <Layout title={post.title}>
      <section className={styles.title}>
        <span className={styles.date}>
          {dayjs(post.date).format("YYYY.MM.DD HH:mm")}
        </span>
        <h1>{post.title}</h1>
      </section>
      <section>
        <Markdown markdown={post.content} />
      </section>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const slug = context.params?.slug as string;
  const posts = typeof slug === "undefined" ? [] : await getPosts(slug);

  return {
    props: {
      post: posts.length > 0 ? posts[0] : undefined,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: (await getPosts()).map(({ slug }) => ({
    params: {
      slug,
    },
  })),
  fallback: false,
});

export default Article;
