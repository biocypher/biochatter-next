import { Analytics } from "@vercel/analytics/react";

import { Home } from "./components/home";
import Script from 'next/script'
import { getServerSideConfig } from "./config/server";

const serverConfig = getServerSideConfig();

export default async function App() {
  return (
    <>
      <Home />
      {serverConfig?.isVercel && <Analytics />}
      <Script
        src="./llm_chat.5e8e8dcb.js"
        strategy="lazyOnload"
      />

    </>
  );
}
