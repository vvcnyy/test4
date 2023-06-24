import Head from "next/head";
import React from "react";

const DefaultHead = ({ children }) => {
  return (
    <Head>
      <title>디미고인 풀 서비스 V2</title>
      <meta name="description" content="그래그래 디미고인 풀 서비스 두 번째 버젼이란다~!" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/android-icon-192x192.png" />
      {/* <script defer data-domain="dimigo.net" src="https://analytics.2w.vc/js/script.js"></script> */}
      {children}
    </Head>
  );
};

export default DefaultHead;