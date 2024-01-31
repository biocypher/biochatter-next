# BioChatter Next

This repository contains the advanced web client of BioChatter, as an 
adaptation of https://github.com/Yidadaa/ChatGPT-Next-Web. It works in
conjunction with the [BioChatter
server](https://github.com/biocypher/biochatter-server) to provide a modern,
fully featured chat experience.

## Docker Compose

The client-server combination can be run using Docker Compose. You need to have
Docker and Docker Compose installed to use this way of building the app. To do
so, you can run, from the `biochatter-next` directory of this repository:

```
cd biochatter-next
docker-compose up -d
```

This will start two services, a server on port 5001 and a client on port 3000.
The client can be accessed in the browser at http://localhost:3000.

## Local Installation

If you want or need to install and run the two services locally and separately,
you need to have [Node.js](https://nodejs.org/en/) and
[yarn](https://yarnpkg.com/) installed. Then, you can run the following code in
the `biochatter-next` directory of this repository:

```console
cd biochatter-next
yarn install
yarn dev
```

Note that you need to have the `.bioserver.env` environment file present (there
is a template with the ending `.template`). For using the regular OpenAI API
(the easiest case), you have to supply a valid API key in `.bioserver.env`.

### Back-end: BioChatter Server

The client requires a server (Flask app) that runs BioChatter, which you can
find at https://github.com/biocypher/biochatter-server. To start it locally,
please follow the instructions there. You can also run the Docker image
available at `biocypher/biochatter-server`.

```console
docker run -p 5001:5001 biocypher/biochatter-server
```

## Development

The front-end has been built as a [Vercel Next.js](https://nextjs.org/docs)
application:

> Next.js is a React framework for building full-stack web applications. You use React Components to build user interfaces, and Next.js for additional features and optimizations.

The provided project structure is:

- biochatter-next/app: App router
- biochatter-next/public: Static assets to be served
- biochatter-next/app/page.tsx: Main Page router
- biochatter-next/app/components: Code for visual components


### Components

The main component is `Home` (biochatter-next/app/components/home.tsx), while the
sidebar is defined inside `Sidebar` (biochatter-next/app/components/sidebar.tsx).

For the Masks, the code is inside `mask.tsx` (biochatter-next/app/components/mask.tsx).

### Internationalization

When you have to add a new visual component, please follow [these
indications](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
provided by Next.JS:

> Next.js enables you to configure the routing and rendering of content to support multiple languages. Making your site adaptive to different locales includes translated content (localization) and internationalized routes.

Add first your text inside [cn.ts](biochatter-next/app/locales/cn.ts) file. Then you can
add the same key(s) inside the English file
([en.ts](biochatter-next/app/locales/en.ts)).

You are ready to use the new key(s) inside your components, for instance:

```tsx
<div className={styles["sidebar-header"]} data-tauri-drag-region>
    <div className={styles["sidebar-title"]} data-tauri-drag-region>
        {Locale.Sidebar.AppTitle}
    </div>
    <div className={styles["sidebar-sub-title"]}>
        {Locale.Sidebar.AppSubtitle}
    </div>
    <div className={styles["sidebar-logo"] + " no-dark"}>
        <ChatGptIcon />
    </div>
</div>
```

### Layout metadata

The fields such as the page title are defined inside
[layout.tsx](biochatter-next/app/layout.tsx).
