
import { unlink, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getServerSideConfig } from "@/app/config/server";
import { BiochatterPath, LOCAL_BASE_URL } from "@/app/constant";

const serverConfig = getServerSideConfig();

async function writeToTempFile(f: File): Promise<string> {
  // save to /tmp
  const bytes = await f.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const filename = nanoid();
  const path = `/tmp/${filename}`
  await writeFile(path, buffer)
  console.log(`open ${path} to see the uploaded file`);
  return path;
}

async function requestNewDocument(tmpFile: string, filename: string) {
  let baseUrl = serverConfig.baseUrl ?? LOCAL_BASE_URL;

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
    },
    method: "POST",
    body: JSON.stringify({filename, tmpFile}),
    signal: controller.signal
  };
  try {
    const res = await fetch(fetchUrl, fetchOptions);
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
    });
  } finally {
    clearTimeout(timeoutId);
    unlink(tmpFile);
  }
}

async function handle(request: NextRequest) {
  const data = request.formData();
  const file: File | null = (await data).get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false })
  }

  try {
    const tmpFile = await writeToTempFile(file);
    const res = await requestNewDocument(tmpFile, file.name);
    return res;
  } catch (e: any) {
    console.error(await e.text());
  }

  return NextResponse.json({ success: true })
}

export const POST = handle;