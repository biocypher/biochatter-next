
import { unlink, writeFile } from "fs/promises";
import * as path from "path";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getServerSideConfig } from "@/app/config/server";
import { BiochatterPath, ERROR_BIOSERVER_OK, LOCAL_BASE_URL } from "@/app/constant";
import { prettyObject } from "@/app/utils/format";
import { BioChatterServerResponse } from "../../common";

const serverConfig = getServerSideConfig();

async function writeToTempFile(f: File): Promise<string> {
  // save to /tmp
  const bytes = await f.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const filename = nanoid();
  const extname = path.extname(f.name);
  const tmpPath = `/tmp/${filename}${extname}`;
  await writeFile(tmpPath, buffer)
  return tmpPath;
}

async function requestNewDocument(
  tmpFile: string, 
  filename: string, 
  ragConfig: string, 
  useRAG: string,
  authValue: string
) {
  let baseUrl = serverConfig.baseUrl ?? LOCAL_BASE_URL;
  const authHeaderName = "Authorization";

  if (!baseUrl.startsWith("http")) {
    baseUrl = `http://${baseUrl}`;
  }

  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }
  const path = BiochatterPath.NewDocument;
  const fetchUrl = `${baseUrl}/${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 10 * 60 * 1000);
  const fetchOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      [authHeaderName]: authValue,
    },
    method: "POST",
    body: JSON.stringify({filename, tmpFile, ragConfig, useRAG}),
    signal: controller.signal
  };
  try {
    const res = await fetch(fetchUrl, fetchOptions);
    const jsonBody = await res.json();
    const value = jsonBody as BioChatterServerResponse;
    if (value.code !== ERROR_BIOSERVER_OK) {
      console.error(value.error ?? "Unknown errors occurred in biochatter-server")
    }
    return NextResponse.json(jsonBody);
  } finally {
    clearTimeout(timeoutId);
    unlink(tmpFile);
  }
}

async function handle(request: NextRequest) {
  const authValue = request.headers.get("Authorization") ?? "";
  const data = request.formData();
  const file: File | null = (await data).get('file') as unknown as File;
  const ragConfig: string | null = (await data).get('ragConfig') as unknown as string;
  const useRAG: string | null = (await data).get("useRAG") as unknown as string;
  
  if (!file) {
    return NextResponse.json({ success: false })
  }

  try {
    const tmpFile = await writeToTempFile(file);
    const res = await requestNewDocument(tmpFile, file.name, ragConfig??"", useRAG??"false", authValue);
    return res;
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(prettyObject(e));
  }
}

export const POST = handle;