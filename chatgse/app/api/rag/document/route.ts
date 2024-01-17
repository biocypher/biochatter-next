import { NextRequest, NextResponse } from "next/server";
import { BioChatterServerResponse, getBaseUrl } from "../../common";
import { BiochatterPath, ERROR_BIOSERVER_OK } from "@/app/constant";
import { prettyObject } from "@/app/utils/format";

async function handle(request: NextRequest) {
  const AUTHORIZATION = "Authorization"
  const authValue = request.headers.get(AUTHORIZATION) ?? "";
  const baseUrl = getBaseUrl();
  const path = BiochatterPath.Document;
  const url = `${baseUrl}/${path}`;
  try {
    const data = await request.json();
    const res = await fetch(
      url,
      {
        method: "DELETE",
        headers: {
          [AUTHORIZATION]: authValue,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      }
    );
    const jsonBody = await res.json();
    const value = jsonBody as BioChatterServerResponse;
    if (value.code !== ERROR_BIOSERVER_OK) {
      console.error(value.error ?? "Unknown errors occurred in biochatter-server")
    }
    return NextResponse.json(jsonBody);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(prettyObject(e));
  }
}

export const DELETE = handle;

