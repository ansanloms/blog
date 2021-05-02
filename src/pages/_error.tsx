import React from "react";
import { NextPage } from "next";

import Layout from "../components/Layout";

const Error: NextPage = () => (
  <Layout title="Error">
    <p>ページが存在しないか、現時点で表示できません。</p>
  </Layout>
);

export default Error;
