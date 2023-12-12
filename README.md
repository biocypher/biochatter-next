# ChatGSE Next

This repository contains an adaptation of 
https://github.com/Yidadaa/ChatGPT-Next-Web. To install and run locally, you
need to have [Node.js](https://nodejs.org/en/) and [yarn](https://yarnpkg.com/)
installed. Then, you can run the following code in the root directory of this
repository:

```
yarn install
yarn --cwd chatgse/ dev
```

Note that for this current version, you need to have present the `.env` and
`.bioserver.env` environment files present (there are templates for both with
the ending `.template`). For using the regular OpenAI API (the easiest case),
you have to supply a valid API key in `.bioserver.env`.

## BioChatter Server

The client requires a server that runs BioChatter, which is found in
`chatgse/biochatter-server`.  To run the server, you need to have
[Docker](https://www.docker.com/) installed.  Then, you can run the following
code in the `chatgse/biochatter-server` subdirectory:

```
docker build -t biochatter-server .
docker run -p 5000:5000 biochatter-server
```