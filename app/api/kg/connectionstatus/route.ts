import { NextRequest, NextResponse } from "next/server";
import { BioChatterServerResponse, getBaseUrl } from "../../common";
import { BiochatterPath, ERROR_BIOSERVER_MILVUS_CONNECT_FAILED, ERROR_BIOSERVER_OK, ERROR_BIOSERVER_UNKNOWN } from "@/app/constant";
import { prettyObject } from "@/app/utils/format";

async function handle(request: NextRequest) {
  const baseUrl = getBaseUrl();
  const data = await request.json();
  const path = BiochatterPath.KGConnectionStatus;
  const url = `${baseUrl}/${path}`;
  try {
    const res = await fetch(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({connectionArgs: data.connectionArgs}),
      }
    );
    const jsonBody = await res.json();
    return NextResponse.json(jsonBody);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(prettyObject(e));
  }
}

export const POST = handle;

