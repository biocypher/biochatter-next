# ChatGSE Next

This repository contains an adaptation of 
https://github.com/Yidadaa/ChatGPT-Next-Web. 

## Docker Compose

The client-server combination can be run using Docker Compose. You need to have
Docker and Docker Compose installed to use this way of building the app. To do
so, you can run, from the root directory of this repository:

```
docker-compose -f chatgse/docker-compose.yml up -d
```

This will start two services, a server on port 5000 and a client on port 3000.
The client can be accessed in the browser at http://localhost:3000.

## Local Installation

If you want or need to install and run the two services locally and separately,
you need to have [Node.js](https://nodejs.org/en/) and
[yarn](https://yarnpkg.com/) installed. Then, you can run the following code in
the root directory of this repository:

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